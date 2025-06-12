import { useMemo } from "react";
import { ObjectItem, ValueStatus } from "mendix";
import { FeaturesType } from "../../typings/MapsProps";
import { GeoJSONFeature, ModeledGeoJSONFeature } from "../../typings/shared";

export function useGeoJSONResolver(geoJSONFeatures: FeaturesType[]): GeoJSONFeature[] {
    console.log("GeoJSON features", geoJSONFeatures);
    const features = useMemo(() => {
        return geoJSONFeatures
            .map(feature => convertModeledGeoJSONFeature(feature))
            .reduce((prev, current) => [...prev, ...current], []);
    }, [geoJSONFeatures]);

    return features;
}

function convertModeledGeoJSONFeature(feature: FeaturesType): ModeledGeoJSONFeature[] {
    if (feature.featureDS && feature.featureDS.status === ValueStatus.Available) {
        return feature.featureDS.items?.map(item => fromDatasource(feature, item)) ?? [];
    }
    return [];
}

function fromDatasource(feature: FeaturesType, item: ObjectItem): ModeledGeoJSONFeature {
    const { geoJSON, color, stroke, weight, opacity, fill, fillColor, fillOpacity, onClickAttribute } = feature;
    return {
        geoJSON: geoJSON ? geoJSON.get(item)?.value ?? "" : "",
        color: color?.get(item)?.value ?? "#3388ff",
        stroke: stroke?.get(item)?.value ?? true,
        weight: weight ? Number(weight.get(item).value) : 3,
        opacity: opacity ? Number(opacity.get(item).value) : 1.0,
        fill: fill?.get(item)?.value ?? true,
        fillColor: fillColor?.get(item)?.value ?? "#3388ff",
        fillOpacity: fillOpacity ? Number(fillOpacity.get(item).value) : 0.2,
        onClickAttribute: onClickAttribute?.get(item).execute // Pass the action
    };
}
