# Web Widgets Filtering

How app users narrow down the records shown by list-style widgets (Data Grid 2, Gallery), and the vocabulary for the filters involved.

## Language

**Fixed Filter**:
A filter placed by the app developer at design time, such as a column filter or a text, number, date or dropdown filter widget.
_Avoid_: Static filter, built-in filter

**Dynamic Filter**:
One condition created by the end user at runtime, made of a Filter Field, an operator and its values. Depending on the operator there can be no value ("is empty"), one, two ("between") or several ("is one of" for enumerations, where any one of them matches).
_Avoid_: Custom filter, ad-hoc filter, query row

**Filter Set**:
The Dynamic Filters currently applied to a list-style widget, combined with AND.
_Avoid_: Filter group, query, filter state

**Filtering Mode**:
A list-style widget's choice between Fixed Filters and a Filter Set. Only one of them is active at a time.
_Avoid_: Filter type, filter style

**Filter Field**:
An attribute the developer has made available for Dynamic Filters, identified by a key and shown to end users under a label. One attribute can back several Filter Fields.
_Avoid_: Filterable attribute, filter option, column, rule, query field
