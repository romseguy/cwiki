import { useRouter } from "next/router";

const AddBranchToBranchPage = () => {
  const router = useRouter();
  let [branchName] =
    "branchName" in router.query && Array.isArray(router.query.branchName)
      ? router.query.branchName
      : [];

  return <>Add a branch to branch {branchName}</>;
};
export default AddBranchToBranchPage;
