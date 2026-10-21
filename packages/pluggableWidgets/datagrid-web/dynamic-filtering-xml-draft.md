# Dynamic filtering: preliminary XML draft (Data Grid 2)

Status: draft, based on the decisions settled in `dynamic-filtering-grill.md`. Nothing here has been applied to `src/Datagrid.xml` yet.
Vocabulary: see the root `CONTEXT.md` (Filtering Mode, Fixed Filter, Dynamic Filter, Filter Set, Filter Field).

## New properties

This is a new tab, **Filtering** (groups **General** and **Texts**), placed after the **General** tab. Existing keys stay where they are.

```xml
<propertyGroup caption="Filtering">
    <property key="filteringMode" type="enumeration" defaultValue="fixed">
        <caption>Filtering mode</caption>
        <description
        >Fixed filters: filter widgets placed in columns or in the header. Dynamic filters: end users build their own filters from the filter fields below.</description>
        <enumerationValues>
            <enumerationValue key="fixed">Fixed filters</enumerationValue>
            <enumerationValue key="dynamic">Dynamic filters</enumerationValue>
        </enumerationValues>
    </property>
    <property key="filterFields" type="object" isList="true" required="false">
        <caption>Filter fields</caption>
        <description>Attributes end users can filter on.</description>
        <properties>
            <propertyGroup caption="General">
                <property key="key" type="string" required="true">
                    <caption>Key</caption>
                    <description
                    >Unique identifier used to store end-user filters. Changing it discards stored filters for this field.</description>
                </property>
                <property key="attribute" type="attribute" dataSource="../datasource" required="true">
                    <caption>Attribute</caption>
                    <description />
                    <attributeTypes>
                        <attributeType name="String" />
                        <attributeType name="AutoNumber" />
                        <attributeType name="Boolean" />
                        <attributeType name="DateTime" />
                        <attributeType name="Decimal" />
                        <attributeType name="Enum" />
                        <attributeType name="Integer" />
                        <attributeType name="Long" />
                    </attributeTypes>
                </property>
                <property key="label" type="textTemplate" required="true">
                    <caption>Label</caption>
                    <description>Name of the field shown to end users.</description>
                </property>
            </propertyGroup>
        </properties>
    </property>
    <property key="filterFieldOptions" type="object" isList="true" required="false">
        <caption>Enumeration options</caption>
        <description>Optional. Replaces the automatic values of an enumeration or Boolean filter field.</description>
        <properties>
            <propertyGroup caption="General">
                <property key="fieldKey" type="string" required="true">
                    <caption>Filter field key</caption>
                    <description>Key of the filter field these options belong to.</description>
                </property>
                <property key="caption" type="textTemplate">
                    <caption>Caption</caption>
                    <description />
                </property>
                <property key="value" type="expression">
                    <caption>Value</caption>
                    <description>Enumeration key, or true/false for Boolean.</description>
                    <returnType type="String" />
                </property>
            </propertyGroup>
        </properties>
    </property>
</propertyGroup>
```

**Notes on the choices above:**

- The attribute types are a copy of the column `attribute` list, so the inferred kind matches column filters exactly (Q26). Associations are left out (Q16).
- The `caption` and `value` pair in `filterFieldOptions` copies the dropdown filter's `filterOptions` (`DatagridDropdownFilter.xml:45-60`) (Q28).
- `filterFieldOptions` is a separate top-level list because object lists can't be nested inside `filterFields` entries.
- The `key` is a plain `string`, not translatable, so that it stays stable (Q15).

## Texts (Texts → Aria labels / new "Dynamic filters" group)

These are needed for i18n whatever presentation is chosen. Captions are placeholders until the presentation is decided.

```xml
<propertyGroup caption="Dynamic filters">
    <property key="addFilterCaption" type="textTemplate" required="false">
        <caption>Add filter</caption>
        <description />
        <translations><translation lang="en_US">Add filter</translation></translations>
    </property>
    <property key="clearFiltersCaption" type="textTemplate" required="false">
        <caption>Clear all</caption>
        <description />
        <translations><translation lang="en_US">Clear all</translation></translations>
    </property>
    <property key="filterFieldAriaLabel" type="textTemplate" required="false">
        <caption>Filter field</caption>
        <description>Assistive technology will read this on the field picker of a filter (Q39).</description>
        <translations><translation lang="en_US">Filter field</translation></translations>
    </property>
    <property key="removeFilterAriaLabel" type="textTemplate" required="false">
        <caption>Remove filter</caption>
        <description
        >Assistive technology will read this, followed by the field label, on the remove button of a filter (Q39).</description>
        <translations><translation lang="en_US">Remove filter</translation></translations>
    </property>
</propertyGroup>
```

## Studio Pro visibility (`Datagrid.editorConfig.ts`)

| `filteringMode` | Hidden                                                          |
| --------------- | --------------------------------------------------------------- |
| `fixed`         | `filterFields`, `filterFieldOptions`, the Dynamic filters texts |
| `dynamic`       | `columns/*/filter`, `columnsFilterable`                         |

`filtersPlaceholder` is **never** hidden, because it renders the grid header (Q21).

In `getCustomCaption`, `filterFields` items show `label (key)` and `filterFieldOptions` items show `fieldKey: caption`.

## Consistency checks (`consistency-check.ts`)

Each check reports an error when:

- a `filterFields[i].key` is empty or appears more than once;
- `filteringMode = dynamic` and `filterFields` is empty;
- a `filterFieldOptions[i].fieldKey` doesn't match any Filter Field's key;
  A further rule, "a `fieldKey` must point to an Enum or Boolean Filter Field", **can't** be a consistency check, because preview props expose an attribute only as its name, not its type. It has to be a runtime check that ignores the options and logs a warning.

## Persisted shape (personalization blob)

The Filter Set is one entry. It is **not** part of `settingsHash`, so editing Filter Fields never resets column widths, order or sort (Q15).

```jsonc
{
  "schemaVersion": 3,             // unchanged (Q30)
  "settingsHash": "…",            // unchanged: columns only
  "columnFilters": [...],         // Fixed mode
  "customFilters": [...],         // Fixed mode (header widgets)
  "dynamicFilters": [             // optional; missing = empty Filter Set
    { "field": "status",  "data": <FilterData from EnumFilterStore.toJSON()> },
    { "field": "created", "data": <FilterData from DateInputFilterStore.toJSON()> },
    { "field": "name",    "data": <FilterData from StringInputFilterStore.toJSON()> }
  ]
}
```

Each row stores the row store's own `toJSON()` output as `data`, so no new per-kind serializer is needed (decision in the shared OpenSpec change `add-dynamic-filtering`, design §3). On load, a row is dropped silently when its `field` no longer exists, its operator isn't valid for the field's kind, or (for enumerations) a value is outside the allowed values (Q5/Q13). The grid also keeps `storeFiltersInPersonalization` as the switch for this (Q5).

The schema version is **not** bumped (Q30). Both widgets reject the whole blob on a version mismatch, which would reset every user's saved layout. Gallery stores the same optional `dynamicFilters` field next to `filters` and `sort`, and keeps `version: 1`.

## Settled since the first draft

- **Gallery (Q20):** the same `filteringMode`, `filterFields` and `filterFieldOptions` are added to `Gallery.xml`, persisted through `storeFilters`.
- **Default Filter Set (Q22):** no default properties in v1.
- **Header filter widgets in Dynamic mode (Q25):** runtime only, through a Dynamic mode context and an error alert. No XML impact.
- **Debounce (Q29):** hard-coded to 500 ms, with no property.

## Not in this draft (still open)

- Nothing. Presentation was settled in Q32–Q42 (see `dynamic-filtering-grill.md`). It adds no XML beyond `filterFieldAriaLabel`, and placement is fixed: below the `filtersPlaceholder` content in the header.
