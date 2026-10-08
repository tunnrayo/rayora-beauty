import Notice from "@/components/Notice";

export default function NotFound() {
  return (
    <Notice
      title="We could not find that page"
      message="The page may have moved, or the link may be incorrect. Let us get you back to something lovely."
      actionHref="/shop"
      actionLabel="Continue shopping"
    />
  );
}
