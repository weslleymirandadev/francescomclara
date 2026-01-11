import { getUsers } from "./actions"
import UserListClient from "./UserListClient"

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="w-full bg-white min-h-screen">
      <UserListClient users={users || []} />
    </div>
  )
}