# openhab-hauer-items

Workspace-Paket für Item-Namen, Item-Metadaten, Core-Semantik und modellgebundene Selektoren.

## Aufgabe

Dieses Paket ist der kanonische Ort für:

- `ITEMS`
- `ITEM_META`
- `Location`, `Equipment`, `Point`, `Property`
- `ITEM_NAMES_BY_TYPE`
- repo-spezifische Custom-Tags
- Selektoren, die direkt auf Item-Metadaten und Semantik beruhen

## Wichtige Dateien

- [src/generated-items.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/generated-items.ts)
- [src/item-meta.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/item-meta.ts)
- [src/custom-tags.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/custom-tags.ts)
- [src/batteries.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/batteries.ts)
- [src/lights.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/lights.ts)
- [src/openings.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/openings.ts)
- [src/presence.ts](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/src/presence.ts)
- [scripts/generate-items.js](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/scripts/generate-items.js)
- [model/SemanticTags.csv](/Users/michael/dev/repos/openhab-automation/packages/openhab-hauer-items/model/SemanticTags.csv)

## Design

Die Semantikklassifikation folgt dem openHAB-Core-Modell:

- `Location`
- `Equipment`
- `Point`
- `Property`

Dabei gilt:

- Core-Semantik kommt aus `SemanticTags.csv`
- `metadata.semantics` wird berücksichtigt
- `item.type` bleibt technischer Itemtyp und wird nicht als Semantik interpretiert
- unbekannte Tags bleiben als `nonSemanticTags` erhalten

## Skripte

```bash
npm run build -w openhab-hauer-items
npm run generate:items -w openhab-hauer-items
```

## Public API

Root-API (vollständige Map, CJS+ESM):

```ts
import { ITEMS, batteries, lights, openings, presence } from 'openhab-hauer-items'
```

Granulare Runtime-API (tree-shakable Named Exports):

```ts
import {
  KNX_Helios_ManualMode,
  KNX_Helios_KWRL_Ist_Stufe,
} from 'openhab-hauer-items/items'
```

## Hinweise

- `generated-items.ts` ist generiert und nicht manuell zu pflegen
- Warnungen des Generators weisen auf Modellprobleme in der Instanz hin, nicht auf TypeScript-Probleme
