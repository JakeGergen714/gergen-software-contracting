export default function AdminProjectPage() {
  if (import.meta.env.DEV) {
    console.warn(
      'AdminProjectPage is deprecated. Use admin/project routes wired through AdminProjectLayout.'
    );
  }
  return null;
}
