"use client";

import { useEffect, useState } from "react";

export default function UserList({ teamId }: { teamId: string }) {
  const [users, setUsers] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  });

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.map((user: any, index: number) => (
        <li key={index} onClick={() => alert(user.name)}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}