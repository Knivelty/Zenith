import { Select } from "antd";
import { supportedNetworksArray } from "../../../dojo/supportNetwork";
import { NetworkLayer } from "../../../dojo/createNetworkLayer";

export function SelectNetwork({
    networkLayer,
}: {
    networkLayer: NetworkLayer | null;
}) {
    if (!networkLayer) {
        return <div></div>;
    }

    const { config } = networkLayer;

    const onChange = (value: string) => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("network", value);

        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
        window.location.reload();
    };

    return (
        <Select
            className="absolute top-10 right-10 z-20"
            showSearch
            placeholder="Select Network"
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) =>
                (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
            }
            options={supportedNetworksArray.map((c) => {
                return { label: c.name, value: c.name };
            })}
            defaultValue={config?.name}
        />
    );
}
