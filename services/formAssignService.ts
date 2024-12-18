import { PrismaClient, Prisma } from "@prisma/client";

export async function assignFormToGroup(
  client: Prisma.TransactionClient,
  formid: string,
  groupid: string
) {
  const result = await client.userGroupForm.create({
    data: {
      formId: formid,
      groupId: groupid,
    },
  });
  const group = await client.userGroup.findUnique({
    where: {
      id: groupid,
    },
    include: {
      users: true,
    },
  });
  if (!group) return result;

  await Promise.all(
    group.users.map((user) => assignFormToUser(client, formid, user.id))
  );

  return result;
}

export async function assignFormToUser(
  client: Prisma.TransactionClient,
  formid: string,
  userid: string
) {
  const result = await client.userForm.create({
    data: {
      formId: formid,
      userId: userid,
    },
  });
  return result;
}

export async function removeFormFromGroup(
  client: Prisma.TransactionClient,
  formid: string,
  groupid: string
) {
  const group = await client.userGroup.findUnique({
    where: { id: groupid },
    include: { users: true },
  });
  if (!group) {
    throw new Error("groupId does not correspond to a known group")
  };

  const result = await Promise.all(
    group.users.map((user) => removeFormFromUser(client, formid, user.id))
  );

  await client.userGroupForm.delete({
    where: {
      groupId_formId: {
        groupId: groupid,
        formId: formid
      }
    }
  })
  return result;
}

export async function removeFormFromUser(
  client: Prisma.TransactionClient,
  formid: string,
  userid: string
) {
  const result = await client.userForm.delete({
    where: {
      userId_formId: {
        userId: userid,
        formId: formid,
      },
    },
  });

  return result;
}
