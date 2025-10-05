import GaleriaBlock from "./galeria-block"
import ManifiestoBlock from "./manifiesto-block"
import MoodboardBlock from "./moodboard-block"
import LifestyleBlock from "./lifestyle-block"
import TextoBlock from "./texto-block"
import type { MundoLaFashionItem } from "@/lib/types"

interface ContentRendererProps {
  item: MundoLaFashionItem
}

export default function ContentRenderer({ item }: ContentRendererProps) {
  switch (item.tipo_contenido) {
    case "galeria":
      return <GaleriaBlock item={item} />
    case "manifiesto":
      return <ManifiestoBlock item={item} />
    case "moodboard":
      return <MoodboardBlock item={item} />
    case "lifestyle":
      return <LifestyleBlock item={item} />
    case "texto":
      return <TextoBlock item={item} />
    case "video":
      // Para futuro: componente de video
      return <TextoBlock item={item} />
    default:
      return <TextoBlock item={item} />
  }
}
