import type { User } from "@/common/api/auth.schema";
import { adminMessages } from "@/features/admin/constants/adminMessages";
import { pathRoleLabels } from "@/features/admin/constants/pathRoleLabels";

type UsersTableProps = {
  users: User[];
  search: string;
  onOpen: (userId: string) => void;
};

export function UsersTable({ users, search, onOpen }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p role="status" className="text-[#C9C9D6]">
        {search ? adminMessages.noResults(search) : adminMessages.NO_USERS}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[18px] border border-white/15 bg-[#000E2799]">
      <table className="w-full min-w-[640px] text-left text-[15px]">
        <thead className="border-b border-white/15 text-sm text-[#C9C9D6]">
          <tr>
            <th className="p-4 font-semibold">Nombre</th>
            <th className="p-4 font-semibold">Correo</th>
            <th className="p-4 font-semibold">Confirmado</th>
            <th className="p-4 font-semibold">Roles</th>
            <th className="p-4" aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/10 last:border-0"
            >
              <td className="p-4">{user.name}</td>
              <td className="p-4 text-[#E6E6EE]">{user.email}</td>
              <td className="p-4">{user.emailVerified ? "Sí" : "No"}</td>
              <td className="p-4">
                {user.pathRoles.length === 0 ? (
                  <span className="text-[#C9C9D6]">Sin roles</span>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {user.pathRoles.map(({ path, role }) => (
                      <li
                        key={path.id}
                        className="rounded-full border border-primary/60 px-3 py-1 text-sm"
                      >
                        {path.name} · {pathRoleLabels[role]}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="p-4 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(user.id)}
                  aria-label={`Ver ${user.name}`}
                  className="min-h-11 rounded-full px-4 font-semibold text-primary hover:text-[#FFA34D]"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
