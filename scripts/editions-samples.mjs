/**
 * What counts as sample Shop data, for scripts/editions-remove-samples.mjs
 * (and checked in scripts/editions-test.ts against a made up dataset).
 * Each group is a GROQ query; KEEP is never touched whatever matches.
 */
export const KEEP = [
  "editions-collection-01",
  "drafts.editions-collection-01",
  "editionsSettings",
  "drafts.editionsSettings",
  "editionsShipping",
  "drafts.editionsShipping",
];

const RECORDS = `["editionsOrder", "editionsCollector", "editionsCounter", "editionsNotify", "editionsProposal", "editionsSettings", "editionsShipping", "editionsCategory"]`;

export const SAMPLE_GROUPS = [
  [
    "Sample content (test Collection, pieces, artist)",
    `*[_type match "editions*" && !(_type in ${RECORDS}) && (isTestData == true || string::startsWith(_id, "editions-test-") || string::startsWith(_id, "drafts.editions-test-"))]`,
  ],
  ["Test orders", `*[_type == "editionsOrder" && testMode == true]`],
  ["Collectors from test orders", `*[_type == "editionsCollector" && count(*[_type == "editionsOrder" && lower(email) == lower(^.email) && testMode != true]) == 0]`],
  ["The collector counter", `*[_type == "editionsCounter" && count(*[_type == "editionsOrder" && testMode != true]) == 0]`],
  ["Notify requests saved during testing", `*[_type == "editionsNotify"]`],
  ["Proposals sent during testing", `*[_type == "editionsProposal"]`],
  ["Shop emails waiting to send", `*[_type == "emailQueued" && email.sender == "editions"]`],
  ["Shop sign ups waiting for Kit", `*[_type == "signupPending" && kind == "shop"]`],
];
