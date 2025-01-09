# Detect unused media

This extension check if media assets (located in `assets/images`) are referenced in the `.adoc` content with `image:` or `video:`.

You can configure this extension from configuration with attributes:

| Attribute             | Description                                                                  | Default value |
|-----------------------|------------------------------------------------------------------------------|---------------|
| excludeImageExtension | List of image extensions to exclude from detection.                          | ['.cast']     |

**IMPORTANT**
* By default, the `.cast` extension are ignored

## Setup

1.  Add the extension to your playbook (site.yml), use any url/name that fits your needs:
   ```yml
   antora:
     extensions:
     - require: ./lib/antora//detect-unused-images/detect-unused-media.js
       excludeImageExtension:  ['.png', 'gif']       
   ```
