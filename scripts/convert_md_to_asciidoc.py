import os, re, fnmatch, subprocess


def convert_to_adoc(file_name, file_path):
    adoc_file = file_name.replace(".md", ".adoc")
    print("convert file " + file_path + " to asciidoc")
    doc = subprocess.Popen(["kramdoc", "--format=GFM", "--output=md/" + adoc_file, file_path])
    doc.wait()
    adoc_file_path = os.path.join("md", adoc_file)
    with open(adoc_file_path) as adoc:
        adoc_read = adoc.read();
        adoc_read = re.sub(r"(:::\s*info)", "[NOTE]\n====\n", adoc_read, 0, re.MULTILINE | re.IGNORECASE)
        adoc_read = re.sub(r"(:::\s*warning)", "[WARNING]\n====\n", adoc_read, 0, re.MULTILINE | re.IGNORECASE)
        adoc_read = re.sub(r"(:::\s*danger)", "[IMPORTANT]\n====\n", adoc_read, 0, re.MULTILINE | re.IGNORECASE)
        adoc_read = re.sub(r":::", "====", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r" ====", "====", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"(^=.*\n)\r*\n*(.*)", "\\1:description: \\2\\n\\n\\2", adoc_read, 1, re.MULTILINE)
        adoc_read = re.sub(r"^\+\+\+<a id=\"(.+)\">\+\+\+\+\+\+<\/a>\+\+\+$", "[#\\1]", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"link\:(.*)\.md", "xref:\\1.adoc]", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"link\:(.*)\.adoc", "xref:\\1.adoc]", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"xref\:(.*)\.md", "xref:\\1.adoc]", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"\+\+\+(<asciinema-player(.*)>)\+\+\+\+\+\+", "\\n++++\\n\\1", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"(</asciinema-player>)\+\+\+", "\\1\\n++++\\n", adoc_read, 0, re.MULTILINE)
        adoc_read = re.sub(r"<asciinema-player src=\"bonita/images/\$\{varVersion\}/(.*).cast\"","<asciinema-player src=\"_images/images/\\1.cast\"", adoc_read, 0, re.MULTILINE)
        with open(adoc_file_path, "w") as f:
            f.write(adoc_read)
            f.close()
    print("file " + file_path + " converted to adoc " + adoc_file)


def main():
    global f_path, f_name
    for dname, dirs, files in os.walk("md"):
        for f_name in fnmatch.filter(files, "*.md"):
            f_path = os.path.join(dname, f_name)
            with open(f_path) as f:
                result = re.sub(r"(\|.*\n.*\-\|)", "\\n\\1", f.read(), 0, re.MULTILINE)
                result = re.sub(r"(\`\`\`xml)", "\\n\\1", result, 0, re.MULTILINE)
                result = re.sub(r".*(:::)", "\\1", result, 0)
                result = re.sub(r"(:::\s*warning\s*\n)(\s*)(\*\*Warning:\*\*|\*\*Warning\*\*:|\s*)\s*(.*)", "\\1\\4", result)
                result = re.sub(r"(:::\s*info\s*\n)(\s*)(\*\*Note:\*\*|\*\*Note\*\*:|\s*)\s*(.*)", "\\1\\4", result)
                result = re.sub(r"(:::\s*danger\s*\n)(\s*)(\*\*Danger:\*\*|\*\*Danger\*\*:|\s*)\s*(.*)", "\\1\\4", result)
                result = re.sub(r"^(\*.*\n)(```(\n.*)*```)(\n\*.*)$", "\\1\\n\\2\\n\\4", result)
                result = re.sub(r"<script(.*)(\n.*)*(<asciinema-player(.*)</asciinema-player>)(\n.*)*(<script(.*)</script>)", "\\3\\n", result)
            with open(f_path, "w") as f:
                f.write(result)
                f.close()
            convert_to_adoc(f_name, f_path)
            os.remove(f_path)


main()
