export const selectionInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="selectionAll" type="selection" dataSource="requiredDataSource">
                <caption>Selection (all types)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="None"/>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="selectionSingleMulti" type="selection" dataSource="requiredDataSource">
                <caption>Selection (single or multi)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="selectionMulti" type="selection" dataSource="requiredDataSource">
                <caption>Selection (multi only)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionAll" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (all)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="None"/>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionSingleMulti" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (single or multi)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionMulti" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (multi only)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
             <property key="optionalDataSource" type="datasource" isList="true" required="false">
                <caption>Optional data source</caption>
                <description />
            </property>
             <property key="requiredDataSource" type="datasource" isList="true">
                <caption>Optional data source</caption>
                <description />
            </property>
        </propertyGroup>
    </properties>
</widget>`;

export const selectionInputNative = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="selectionAll" type="selection" dataSource="requiredDataSource">
                <caption>Selection (all types)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="None"/>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="selectionSingleMulti" type="selection" dataSource="requiredDataSource">
                <caption>Selection (single or multi)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="selectionMulti" type="selection" dataSource="requiredDataSource">
                <caption>Selection (multi only)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionAll" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (all)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="None"/>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionSingleMulti" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (single or multi)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Single"/>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
            <property key="optionalSelectionMulti" type="selection" dataSource="optionalDataSource">
                <caption>Optional selection (multi only)</caption>
                <description/>
                <selectionTypes>
                    <selectionType name="Multi"/>
                </selectionTypes>
            </property>
             <property key="optionalDataSource" type="datasource" isList="true" required="false">
                <caption>Optional data source</caption>
                <description />
            </property>
             <property key="requiredDataSource" type="datasource" isList="true">
                <caption>Optional data source</caption>
                <description />
            </property>
        </propertyGroup>
    </properties>
</widget>`;
