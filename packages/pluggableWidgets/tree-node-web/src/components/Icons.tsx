import { createElement, ReactElement } from "react";
import { WebIcon } from "mendix";
import classNames from "classnames";
import { Icon } from "mendix/components/web/Icon";

export const ChevronIcon = ({ className }: { className: string }): ReactElement => (
    <svg
        className={className}
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M1.64598 4.64601C1.69242 4.59945 1.7476 4.5625 1.80834 4.5373C1.86909 4.51209 1.93421 4.49911 1.99998 4.49911C2.06575 4.49911 2.13087 4.51209 2.19161 4.5373C2.25236 4.5625 2.30753 4.59945 2.35398 4.64601L7.99998 10.293L13.646 4.64601C13.6925 4.59952 13.7477 4.56264 13.8084 4.53749C13.8691 4.51233 13.9342 4.49938 14 4.49938C14.0657 4.49938 14.1308 4.51233 14.1916 4.53749C14.2523 4.56264 14.3075 4.59952 14.354 4.64601C14.4005 4.6925 14.4373 4.74769 14.4625 4.80842C14.4877 4.86916 14.5006 4.93426 14.5006 5.00001C14.5006 5.06575 14.4877 5.13085 14.4625 5.19159C14.4373 5.25233 14.4005 5.30752 14.354 5.35401L8.35398 11.354C8.30753 11.4006 8.25236 11.4375 8.19161 11.4627C8.13087 11.4879 8.06575 11.5009 7.99998 11.5009C7.93421 11.5009 7.86909 11.4879 7.80834 11.4627C7.7476 11.4375 7.69242 11.4006 7.64598 11.354L1.64598 5.35401C1.59942 5.30756 1.56247 5.25239 1.53727 5.19164C1.51206 5.1309 1.49908 5.06578 1.49908 5.00001C1.49908 4.93424 1.51206 4.86912 1.53727 4.80837C1.56247 4.74763 1.59942 4.69245 1.64598 4.64601V4.64601Z" />
    </svg>
);

export const CustomHeaderIcon = ({ icon }: { icon: WebIcon }): ReactElement => {
    let currentIcon = icon;
    if (icon && icon.type !== "image") {
        currentIcon = { ...icon, iconClass: classNames(icon.iconClass, "widget-tree-node-branch-header-icon") };
    }
    return <Icon icon={currentIcon} />;
};
