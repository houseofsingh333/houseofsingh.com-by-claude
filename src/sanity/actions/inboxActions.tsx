import { useState } from "react";
import { useClient, type DocumentActionComponent, type DocumentActionProps } from "sanity";

/**
 * The Inbox's one click actions (approved 13 Nov): "Mark replied" ("Mark
 * reviewed" on a For artists proposal) and "Archive", each undone with a
 * second click. They change only the message's own ticks, saved at once
 * (the messages are liveEdit, so there is no Publish step). Plain React.
 */
type Message = { replied?: boolean; archived?: boolean };

const message = (props: DocumentActionProps) => (props.published ?? props.draft ?? {}) as Message;

function useToggle(props: DocumentActionProps, field: "replied" | "archived") {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [busy, setBusy] = useState(false);
  const run = async (value: boolean) => {
    setBusy(true);
    try {
      await client.patch(props.id).set({ [field]: value }).commit();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
    setBusy(false);
    props.onComplete();
  };
  return { busy, run };
}

export const MarkRepliedAction: DocumentActionComponent = (props) => {
  const { busy, run } = useToggle(props, "replied");
  const done = Boolean(message(props).replied);
  const word = props.type === "editionsProposal" ? "reviewed" : "replied";
  return {
    label: busy ? "Saving" : done ? "Mark as new" : `Mark ${word}`,
    title: done ? `Back under New (not ${word}).` : `Out of New and the daily email: ${word}.`,
    disabled: busy,
    onHandle: () => run(!done),
  };
};
MarkRepliedAction.displayName = "MarkRepliedAction";

export const ArchiveAction: DocumentActionComponent = (props) => {
  const { busy, run } = useToggle(props, "archived");
  const archived = Boolean(message(props).archived);
  return {
    label: busy ? "Saving" : archived ? "Unarchive" : "Archive",
    title: archived ? "Back into the Inbox." : "Out of New and the daily email, kept for the record.",
    disabled: busy,
    onHandle: () => run(!archived),
  };
};
ArchiveAction.displayName = "ArchiveAction";
