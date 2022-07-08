// Utility functions, including functionality for showing, hiding, and handling modals
// is contained in this file.
function is_valid_name(name) {
    if (name === "") {
        return false
    }
    let valid_pattern = /[^A-Za-z_]/
    return !valid_pattern.test(name)
}

function make_valid_name(name) {
    return name.toLowerCase().replace(/ /g, "_");
}

function title_case(str) {
    str = str.replace(/-/g, " ");
    return str.replace(/\w\S*/g, word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

function extract_elements_from_id(_id, filter_words, get_resource = true, get_row_num = true) {
    let id_elements = _id.split("-");
    let filtered_elements = id_elements.filter(function (value, index, arr) {
        return !(filter_words.includes(value));
    });
    let resource = filtered_elements.slice(0, -1).join("-");
    let row_num = filtered_elements.slice(-1);

    output = [];
    if (get_resource) {
        output.push(resource);
    }

    if (get_row_num) {
        output.push(row_num);
    }

    return output
}

function toggle_checkboxes(resource) {
    let toggle_state = document.getElementById(resource.concat("-select-all")).checked;
    let class_name = resource.concat("-checkbox");
    const checkboxes = document.getElementsByClassName(class_name);

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked != toggle_state) {
            checkboxes[i].click();
        }
    }
}

// making this a function so that it's more clear what it's doing in the code
function generate_uuid() {
    return crypto.randomUUID();
}

function generate_id_from_string(string, suffix = "") {
    let uid = string.toLowerCase().replace(/ /g, "-");
    uid = suffix != "" ? uid + "-" + suffix : uid;
    return uid
}

function show_modal(modal_id) {
    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modal_id));
    modal.show();
}

function hide_modal(modal_id) {
    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modal_id));
    modal.hide();
}

// this function should not be considered a generalized approach to convert
// JSON to YAML. It works specifically with the SAVED_TABLES variable for one
// specific purpose.
function convert_to_yaml() {
    let config = "---\n";
    for (let table of Object.keys(SAVED_TABLES)) {
        config += `${table}:\n`
        for (let resource of Object.keys(SAVED_TABLES[table])) {
            config += `  ${resource}:\n`;
            for (let field of Object.keys(SAVED_TABLES[table][resource])) {
                config += `    ${field}:\n`;
                for (let parameter of Object.keys(SAVED_TABLES[table][resource][field])) {
                    let value = SAVED_TABLES[table][resource][field][parameter];
                    config += `      ${parameter}: ${value}\n`;
                }
            }
        }
    }
    // config += "---";
    return config
}

// Likewise, this function should not be considered a general approach to convert
// YAML to JSON. It is certainly more general than convert_to_yaml(), but doesn't
// account for all the features found in YAML and is again intended for one specific
// purpose. 

// However, because we can't guarantee that any given YAML config file was
// generated with this application, we want to try to make it as general as possible
// to allow users to modify config files that were made using some other mechanism.

// Unfortunately, though, at this time, the function only supports the most basic of
// YAML files, which are those that have been generated by this application. Updates
// will be made in the future.
function convert_to_json(lines) {
    let json = {};
    let top_level_indent = 0;
    let prev_indent = 0;
    let cur_indent, prev_key, cur_key, cur_value;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // The first thing we want to do is figure out how indented the top-level key is
        if (line === "---") {
            top_level_indent = get_indent_level(lines[i + 1]);
            continue;
        };

        cur_indent = get_indent_level(line);
        [cur_key, cur_value] = line.replace(/^ /g, "").replace(": ", ":").split(":");
        cur_value = cur_value === "" ? {} : cur_value;

        // If the current line is indented as far as the top-level keys, then it will
        // be considered a top-level key
        if (cur_indent === top_level_indent) {
            prev_key = cur_key;
            json[cur_key] = cur_value;
        }

        // Otherwise, we need to perform some checks to see if we're nesting deeper, or
        // coming back up the stack. Here, we check if we're going deeper.
        if (cur_indent > prev_indent) {
            prev_indent = cur_indent;
            json[prev_key][cur_key] = cur_value;
            prev_key = cur_key;
        }

        // If we're moving back up the stack, but we're not back to the top-level indent
        // then we need to reset current and previous indents.
        if (cur_indent < prev_indent && cur_indent !== top_level_indent) {
            prev_indent = cur_indent;

        }
        return json
    }
}

function get_indent_level(str) {
    const spaces = str.match(/^ +/);
    return spaces === null ? 0 : spaces.length;
}