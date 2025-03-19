import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { users } from "@/utils/users";
import { ProfileForm } from "./ProfileForm";

const ProfilePage = async() => {
    const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const userData = await users.getUser(user.id);
  if (!userData) redirect('/login');

  return <ProfileForm initialData={userData} />;
};

export default ProfilePage;
