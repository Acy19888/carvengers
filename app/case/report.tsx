import { useLocalSearchParams, Redirect } from "expo-router";

export default function ReportScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  return <Redirect href={`/case/analysis?caseId=${caseId}`} />;
}
