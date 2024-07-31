import { DatagridPreviewProps } from "../../typings/DatagridProps";
import { check } from "../Datagrid.editorConfig";

describe("consistency check", () => {
    describe("returns error when row select method and action trigger overlap", () => {
        test("selection: single by row click", () => {
            const props = {
                itemSelection: "Single",
                itemSelectionMethod: "rowClick",
                onClick: {},
                onClickTrigger: "single",
                columns: [],
                groupList: [],
                groupAttrs: []
            };

            expect(check(props as unknown as DatagridPreviewProps)).toMatchSnapshot();
        });

        test("selection: multi by row click", () => {
            const props = {
                itemSelection: "Multi",
                itemSelectionMethod: "rowClick",
                onClick: {},
                onClickTrigger: "single",
                columns: [],
                groupList: [],
                groupAttrs: []
            };

            expect(check(props as unknown as DatagridPreviewProps)).toMatchSnapshot();
        });
    });

    describe("returns empty array when row selection method and action trigger not overlap", () => {
        test("selection: none", () => {
            const props = {
                itemSelection: "None",
                itemSelectionMethod: "checkbox",
                onClick: {},
                onClickTrigger: "single",
                columns: [],
                groupList: [],
                groupAttrs: []
            };

            expect(check(props as unknown as DatagridPreviewProps)).toEqual([]);
        });

        test("selection: single by checkbox", () => {
            const props = {
                itemSelection: "Single",
                itemSelectionMethod: "checkbox",
                onClick: {},
                onClickTrigger: "single",
                columns: [],
                groupList: [],
                groupAttrs: []
            };

            expect(check(props as unknown as DatagridPreviewProps)).toEqual([]);
        });

        test("selection: single by checkbox, trigger: double", () => {
            const props = {
                itemSelection: "Single",
                itemSelectionMethod: "checkbox",
                onClick: {},
                onClickTrigger: "double",
                columns: [],
                groupList: [],
                groupAttrs: []
            };

            expect(check(props as unknown as DatagridPreviewProps)).toEqual([]);
        });
    });
});
