import root_paths from "../../dynamic_configuration/root_paths.ts";

// @ts-nocheck
const fs = (await import("fs")).default;
const url = (await import("url")).default;
const path = (await import("path")).default;
const cluster = (await import("cluster")).default;
const env = (await import("$/server/env.js")).default;

const src_path = root_paths.src_path;

const load_startup = async function (app, root = path.join(src_path, "startup")) {
    const directory_content = fs.readdirSync(root);

    for (const item of directory_content) {
        const item_absolute_path = path.join(root, item);

        const item_stats = fs.statSync(item_absolute_path);
        if (item_stats.isDirectory()) {
            await load_startup(app, item_absolute_path);
        } else {
            if (cluster.isPrimary && item.endsWith(".run.js")) {
                const run = (await import(url.pathToFileURL(item_absolute_path))).run;
                if (typeof run == "function") {
                    await run(app);
                }
            }
        }
    }
};

export default load_startup;
