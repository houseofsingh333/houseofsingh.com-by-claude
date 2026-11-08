# Adding a project's photographs from a folder

This adds a whole folder of photographs to a project in one go. They go into the project's **Photographs** list in the order of their file names, the page lays them out by itself from their shapes, and each one gets a first draft of its alt text for you to read and correct. Everything goes into a **draft** of the project, so nothing changes on the website until you press Publish in the Studio.

## 1. Name the files in the order you want

The order of the file names is the order on the page. Numbering them is the simplest way:

```
01 car.jpg
02 tailoring.jpg
03 umbrella.jpg
```

The words after the number become the draft alt text: "02 tailoring.jpg" in the project Zamana becomes "Zamana: tailoring". You will improve these in the Studio before publishing, so they only need to be a reminder of what each photograph shows.

## 2. Create a write token (once)

The script needs permission to add photographs to Sanity. That permission is a token, a long password made only for this.

1. Go to sanity.io/manage and open the House of Singh project.
2. Open **API**, then **Tokens**, then **Add API token**.
3. Name it "Add project photos" and choose the **Editor** permission.
4. Copy the token. Sanity shows it only once. Keep it somewhere private, such as your password manager. Never put it in a message, a file in the website's code, or a screenshot.

## 3. Run it

### From Terminal

Open Terminal in the website's folder and first do a **dry run**. It only looks: it lists the photographs in order with their draft alt texts, and changes nothing.

```
node scripts/add-project-photos.mjs "/path/to/the folder" --project zamana --dry-run
```

`zamana` is the project's address name, the last part of its web address (houseofsingh.com/projects/zamana). For a new project, add its title too: `--title "Zamana"`.

If the list looks right, run it for real with your token:

```
SANITY_WRITE_TOKEN=paste-the-token-here node scripts/add-project-photos.mjs "/path/to/the folder" --project zamana
```

### By asking Claude Code or Cowork

You can also ask, in plain words, for example: "Add the photographs in my Desktop folder Zamana final to the project zamana. Do a dry run first and show me the list." Claude will run the same script. When it asks for the token, give it through the secure token box, never by typing it into the chat.

## 4. Check and publish in the Studio

Open the project in the Studio. Under **Photographs** you will see them in order, each marked Landscape, Portrait or Square with its Layout (Auto).

- Read each **alt text** and rewrite it so it describes the photograph for someone who cannot see it.
- Add a **caption** where you want one, for example the place.
- Change a **Layout** only if you want to, for example Full bleed for one wide photograph.
- Drag to reorder if needed.

Then press **Publish**. Running the script again for the same folder skips photographs that are already there.
