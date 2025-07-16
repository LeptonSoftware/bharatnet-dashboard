import { HTTPEvent, toWebRequest } from "vinxi/http";

export async function GET(event: HTTPEvent) {
  const request = toWebRequest(event);
  const { searchParams } = new URL(request.url);
  const circleId = searchParams.get("circle")!;
  const district = searchParams.get("district")!;
  const entityType = searchParams.get("entityType");

  if (!circleId || !district || !entityType) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const url =
    "http://networkaccess.bnet.leptonsoftware.com/RVNL/Smartinventory_services/api/VectorLayer/GetVectorData";
  const options = {
    method: "POST",
    headers: {
      Authorization:
        "Bearer 0d30FDCdlOou9MXLVh5xExO2aCp7IfgAgTHm0-VumVOc8JIi1J1jU5Nqu8iBDzoVK8ZxQ8jMrFWJz3BL3PBKB0DsX5fD99-LZVcK9i7aLN2rVcxr9ybrClXdVT0H2mxtoe0Ovfu8GK7Zz2T2Us1dJ4EkGDqzpmeKUIQrYkrWN1iM2ySLZYnMM8CUZCMCIaJ6D0vyzC3NRntRG0LxiOWZWOCtPSaMSOBn-EPVpKbih3e3SbrZOPPP4K8_1O6thkmQI69ViIut0HiiIwl8sLEM4_Fdj7ndjKuLXD8nU0etYgR1NndhATWJq87_s45wsbnLWXAXhc2m1CD1AuSVGupyYcSIKzTRaCIaui9bpvW1aU_Vmq4lS3LO7d7oqgqY0mYg9xIs2ZAxgRb2vAft6GPhCTEXCfz8yTwBy2ZTDW3tiPCA27cRx5Uezrz4BmEt_ZNXsFuBK5JZpdCVzs3Ejdaw1A",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      data: JSON.stringify({
        PrvinceIds: district,
        connectionString: null,
        entityType: entityType,
        lat: null,
        lng: null,
        ticketID: 0,
      }),
    }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Transform to proper GeoJSON format
    const geoJson = {
      type: "FeatureCollection" as const,
      features:
        data.results?.LayersData?.map((layerData: any) => ({
          type: "Feature" as const,
          geometry: layerData.feature.geometry,
          properties: {
            ...layerData.feature.properties,
            // Add layer metadata to properties
            layer: layerData.layer,
            entity_type: layerData.feature.entity_type,
            layer_title: layerData.feature.layer_title,
          },
          id: layerData.feature.id,
        })) || [],
    };

    return new Response(JSON.stringify(geoJson), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}
