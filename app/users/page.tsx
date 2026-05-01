import { prisma } from "@/lib/db";
export default  async function Users() {
    const users = await prisma.users.findMany();
  return (
    <div>
      <h1>Users</h1>
      <div>
        {users.map((user) => (
          <div key={user.id}>
            {user.username}
          </div>
        ))}
      </div>
    </div>
  );
}