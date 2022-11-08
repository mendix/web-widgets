export const expressionInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="myDataSource" type="datasource" isList="true">
                <caption>data source</caption>
                <description />
            </property>
            <property key="expressionReturnTypeType" type="expression" required="true">
                <caption>Expression returnType type</caption>
                <description />
                <returnType type="String" />
            </property>
            <property key="expressionReturnTypeTypeDataSource" type="expression" required="true" dataSource="myDataSource">
                <caption>Expression returnType type with data source</caption>
                <description />
                <returnType type="String" />
            </property>
            <property key="expressionReturnTypeAssignableTo" type="expression" required="true">
                <caption>Expression returnType assignableTo</caption>
                <description />
                <returnType assignableTo="myAttribute" />
            </property>
            <property key="expressionReturnTypeAssignableToDataSource" type="expression" required="true" dataSource="myDataSource">
                <caption>Expression returnType assignableTo with data source</caption>
                <description />
                <returnType assignableTo="myAttribute" />
            </property>
            <property key="myAttribute" type="attribute">
                <caption>My attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="Enum" />
                    <attributeType name="Decimal" />
                    <attributeType name="Boolean" />
                </attributeTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;

export const expressionInputNative = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="myDataSource" type="datasource" isList="true">
                <caption>data source</caption>
                <description />
            </property>
            <property key="expressionReturnTypeType" type="expression" required="true">
                <caption>Expression returnType type</caption>
                <description />
                <returnType type="String" />
            </property>
            <property key="expressionReturnTypeTypeDataSource" type="expression" required="true" dataSource="myDataSource">
                <caption>Expression returnType type with data source</caption>
                <description />
                <returnType type="String" />
            </property>
            <property key="expressionReturnTypeAssignableTo" type="expression" required="true">
                <caption>Expression returnType assignableTo</caption>
                <description />
                <returnType assignableTo="myAttribute" />
            </property>
            <property key="expressionReturnTypeAssignableToDataSource" type="expression" required="true" dataSource="myDataSource">
                <caption>Expression returnType assignableTo with data source</caption>
                <description />
                <returnType assignableTo="myAttribute" />
            </property>
            <property key="myAttribute" type="attribute">
                <caption>My attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="Enum" />
                    <attributeType name="Decimal" />
                    <attributeType name="Boolean" />
                </attributeTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;
