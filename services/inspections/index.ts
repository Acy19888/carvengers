export interface RequestInspectionInput {
  caseId: string;
  tier: "video" | "onsite" | "workshop";
}

export async function requestInspection(
  _input: RequestInspectionInput,
): Promise<void> {
  // TODO: implement scheduling flow
}
