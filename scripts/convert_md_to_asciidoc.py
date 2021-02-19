import os, re, fnmatch, subprocess


def convert_to_adoc(f_name, f_path):
    adoc_file = f_name.replace(".md", ".adoc");
    print("convert file " + f_path + " to asciidoc");
    doc = subprocess.Popen(["kramdoc", "--format=GFM", "--output=md/" + adoc_file, f_path]);
    doc.wait()
    adoc_file_path = os.path.join("md", adoc_file);

    with open(adoc_file_path) as adoc:
        adoc_read = adoc.read();
        adoc_read = re.sub(r"(::: info)", "[NOTE]\n====\n", adoc_read, 0, re.MULTILINE);
        adoc_read = re.sub(r"(::: warning)", "[WARNING]\n====\n", adoc_read, 0, re.MULTILINE);
        adoc_read = re.sub(r":::", "====", adoc_read, 0, re.MULTILINE);
        adoc_read = re.sub(r" ====", "====", adoc_read, 0, re.MULTILINE);
        adoc_read = re.sub(r"^\+\+\+<a id=\"(.+)\">\+\+\+\+\+\+<\/a>\+\+\+$", "[#\\1]", adoc_read, 0, re.MULTILINE);
        with open(adoc_file_path, "w") as f:
            f.write(adoc_read);
            f.close();
    print("file " + f_path + " converted to adoc " + adoc_file);


def main():
    for dname, dirs, files in os.walk("md"):
        for f_name in fnmatch.filter(files, "*.md"):
            f_path = os.path.join(dname, f_name)
            with open(f_path) as f:
                result = re.sub(r"(\|.*\n.*\-\|)", "\\n\\1", f.read(), 0, re.MULTILINE)
                result = re.sub(r"(\`\`\`xml)", "\\n\\1", result, 0, re.MULTILINE)
                result = re.sub(r".*(:::)", "\\1", result, 0)
                result = re.sub(r"(::: warning\n)(\s*)(\*\*Warning:\*\*|\*\*Warning\*\*:|\s*)\s*(.*)", "\\1\\4", result)
            result = re.sub(r"(::: info\n)(\s*)(\*\*Note:\*\*|\*\*Note\*\*:|\s*)\s*(.*)", "\\1\\4", result)
            with open(f_path, "w") as f:
                f.write(result)
                f.close();
            convert_to_adoc(f_name, f_path)
            os.remove(f_path);


main()
