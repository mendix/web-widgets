import i18next from "i18next";

describe("Built-in i18next formats", () => {
    beforeEach(async () => {
        await i18next.init({
            lng: "en-US",
            fallbackLng: "en",
            interpolation: {
                escapeValue: false // React already escapes values
            },
            resources: {
                "en-US": {
                    translation: {
                        basic: "{{name}}!",
                        datetime: "{{date, datetime}}",
                        currency: "{{amount, currency(USD)}}",
                        number: "{{value, number}}"
                    }
                },
                "fr-FR": {
                    translation: {
                        basic: "{{name}}!",
                        datetime: "{{date, datetime}}",
                        currency: "{{amount, currency(EUR)}}",
                        number: "{{value, number}}"
                    }
                },
                "ru-RU": {
                    translation: {
                        basic: "{{name}}!",
                        datetime: "{{date, datetime}}",
                        currency: "{{amount, currency(RUB)}}",
                        number: "{{value, number}}"
                    }
                }
            }
        });
    });

    afterEach(() => {
        // Reset i18next to clean state
        i18next.changeLanguage("en-US");
    });

    test("basic", async () => {
        await i18next.changeLanguage("en-US");

        expect(i18next.t("basic", { name: "John" })).toBe("John!");

        await i18next.changeLanguage("fr-FR");
        expect(i18next.t("basic", { name: "Jean" })).toBe("Jean!");

        await i18next.changeLanguage("ru-RU");
        expect(i18next.t("basic", { name: "Hans" })).toBe("Hans!");
    });

    test("datetime", async () => {
        const testDate = new Date("2025-07-10T14:30:00Z");
        await i18next.changeLanguage("en-US");
        expect(i18next.t("datetime", { date: testDate })).toBe("7/10/2025");
        await i18next.changeLanguage("fr-FR");
        expect(i18next.t("datetime", { date: testDate })).toBe("10/07/2025");
        await i18next.changeLanguage("ru-RU");
        expect(i18next.t("datetime", { date: testDate })).toBe("10.07.2025");
    });

    test("currency", async () => {
        const amount = 1234.56;
        await i18next.changeLanguage("en-US");
        expect(i18next.t("currency", { amount })).toBe("$1,234.56");
        await i18next.changeLanguage("fr-FR");
        expect(i18next.t("currency", { amount })).toBe("1\u202f234,56\u00a0€");
        await i18next.changeLanguage("ru-RU");
        expect(i18next.t("currency", { amount: 1234.56 })).toBe("1\u00a0234,56\u00a0₽");
    });

    test("number", async () => {
        const value = 1234567.89;
        await i18next.changeLanguage("en-US");
        expect(i18next.t("number", { value })).toBe("1,234,567.89");
        await i18next.changeLanguage("fr-FR");
        expect(i18next.t("number", { value })).toBe("1\u202f234\u202f567,89"); // French uses narrow non-breaking space
        await i18next.changeLanguage("ru-RU");
        expect(i18next.t("number", { value })).toBe("1\u00a0234\u00a0567,89"); // Russian uses non-breaking space
    });
});
