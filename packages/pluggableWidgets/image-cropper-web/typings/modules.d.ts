declare module "*.css";
declare module "*.scss";
declare module "*.png" {
    const content: string;
    export = content;
}
