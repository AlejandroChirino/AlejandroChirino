#!/usr/bin/env python3
"""
Lee un archivo Excel o CSV con columnas esperadas y genera un archivo SQL
con INSERTs para `public.products` tomando las columnas especificadas:

Mapeo usado:
- Artículos -> name
- Precios Topes / Precio tope -> price
- Stock -> stock
- Peso -> peso
- Precio en Shein / Precio shein -> precio_compra

El script también intenta:
- Extraer tallas (XS,S,M,L,XL,#41,#40,38,39...) y ponerlas en la columna `sizes` (array)
- Extraer colores de una lista básica en español y ponerlos en `colors` (array)
- Limpiar el `name` removiendo colores/tallas/etiquetas como 'Nuevo'
- Generar una `description` corta basada en el nombre

Uso:
  pip install pandas openpyxl
  python scripts/generate_products_sql.py input.xlsx output.sql

Si el input es CSV, funciona también (csv con separador por defecto ',' ).
"""
import sys
import re
import pandas as pd
from datetime import datetime


COLOR_KEYWORDS = [
    'negro','negra','rosado','rosada','rosa','blanco','blanca','marron','marrón',
    'azul','verde','amarillo','amarilla','gris','carmelita','carmelitas','cafe','café',
    'beige','beich','mandarina','naranja','rosa','rosado','rosada','tricolor'
]

SIZE_TOKENS = ['XS','S','M','L','XL','XXL']

SIZE_REGEX = re.compile(r"\b(XS|S|M|L|XL|XXL)\b", re.IGNORECASE)
HASH_SIZE_REGEX = re.compile(r"#?\s*(\d{2})\b")


def to_number(v):
    if pd.isna(v):
        return None
    if isinstance(v, (int, float)):
        return v
    s = str(v).strip()
    if s == '':
        return None
    s = s.replace(',', '.')
    try:
        if '.' in s:
            return float(s)
        return int(s)
    except Exception:
        try:
            return float(s)
        except Exception:
            return None


def extract_colors(name):
    found = []
    low = name.lower()
    for c in COLOR_KEYWORDS:
        if c in low:
            # normalize 'marrón' -> 'marron'
            found.append(c.replace('ó','o'))
    # Deduplicate while preserving order
    res = []
    for f in found:
        if f not in res:
            res.append(f)
    return res


def extract_sizes(name):
    res = []
    for m in SIZE_REGEX.findall(name):
        tok = m.upper()
        if tok not in res:
            res.append(tok)
    for m in HASH_SIZE_REGEX.findall(name):
        tok = m
        if tok not in res:
            res.append(tok)
    return res


def clean_name(name):
    # remove 'Nuevo' markers and dates like 'Nuevo 31/10/2024'
    name = re.sub(r"\bNuevo\b.*","", name, flags=re.IGNORECASE).strip()
    # remove size tokens and #numbers and color words
    for c in COLOR_KEYWORDS:
        name = re.sub(r"\b" + re.escape(c) + r"\b", '', name, flags=re.IGNORECASE)
    name = SIZE_REGEX.sub('', name)
    name = HASH_SIZE_REGEX.sub('', name)
    # remove parentheses contents like (s)
    name = re.sub(r"\([^)]*\)", '', name)
    # collapse multiple spaces and trim commas
    name = re.sub(r"[,]+", ',', name)
    name = re.sub(r"\s+", ' ', name).strip()
    name = name.strip(' ,')
    # Capitalize first letter
    if name:
        name = name[0].upper() + name[1:]
    return name


def make_description(clean_name, colors, sizes, peso, stock, precio_compra):
    parts = []
    parts.append(f"{clean_name} confeccionado con materiales seleccionados.")
    if colors:
        parts.append(f"Disponible en colores: {', '.join(colors)}.")
    if sizes:
        parts.append(f"Tallas: {', '.join(sizes)}.")
    if peso:
        parts.append(f"Peso aprox. {peso} kg.")
    if stock is not None:
        parts.append(f"Stock inicial: {int(stock)} unidades.")
    if precio_compra:
        parts.append(f"Precio de compra: {precio_compra}.")
    return ' '.join(parts)


def sql_escape(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'","''") + "'"


def array_sql(arr):
    if not arr:
        return 'NULL'
    # return PostgreSQL array literal
    vals = ','.join(["'" + str(x).replace("'","''") + "'" for x in arr])
    return "ARRAY[" + vals + "]::text[]"


def process(df):
    inserts = []
    now = datetime.utcnow().isoformat()
    for idx, row in df.iterrows():
        raw_name = str(row.get('Artículos') or row.get('Articulos') or '').strip()
        if not raw_name or raw_name.lower().startswith('nuevo'):
            continue
        price = to_number(row.get('Precios Topes') or row.get('Precio tope') or row.get('Precio Topes') or row.get('Precio tope'))
        stock = to_number(row.get('Stock') or row.get('Stock'))
        peso = to_number(row.get('Peso') or row.get('peso'))
        precio_compra = to_number(row.get('Precio en Shein') or row.get('Precio shein') or row.get('Precio de compra') or row.get('Precio Shein'))

        colors = extract_colors(raw_name)
        sizes = extract_sizes(raw_name)
        clean = clean_name(raw_name)
        if not clean:
            clean = raw_name
        description = make_description(clean, colors, sizes, peso, stock, precio_compra)

        name_sql = sql_escape(clean)
        desc_sql = sql_escape(description)
        price_sql = 'NULL' if price is None else str(price)
        stock_sql = 'NULL' if stock is None else str(int(stock))
        peso_sql = 'NULL' if peso is None else str(peso)
        precio_compra_sql = 'NULL' if precio_compra is None else str(precio_compra)
        sizes_sql = array_sql([s.upper() for s in sizes])
        colors_sql = array_sql(colors)

        sql = (
            "INSERT INTO public.products (name, description, price, stock, peso, precio_compra, sizes, colors, created_at, updated_at) VALUES ("
            + f"{name_sql}, {desc_sql}, {price_sql}, {stock_sql}, {peso_sql}, {precio_compra_sql}, {sizes_sql}, {colors_sql}, '{now}', '{now}'" + ")" + ";"
        )
        inserts.append(sql)
    return inserts


def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/generate_products_sql.py input.xlsx output.sql")
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2]
    if inp.lower().endswith('.csv'):
        df = pd.read_csv(inp)
    else:
        df = pd.read_excel(inp)

    inserts = process(df)
    with open(out, 'w', encoding='utf8') as f:
        f.write('-- Generated by scripts/generate_products_sql.py\n')
        f.write('BEGIN;\n')
        for s in inserts:
            f.write(s + '\n')
        f.write('COMMIT;\n')
    print(f'Wrote {len(inserts)} INSERT statements to {out}')


if __name__ == '__main__':
    main()
