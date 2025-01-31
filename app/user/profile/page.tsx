/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { updateProfile } from "./updateProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export default async function ProfilePage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={profile.avatarImg || undefined}
                alt={profile.name || ""}
              />
              <AvatarFallback>
                {profile.name?.charAt(0) || profile.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge
                variant={profile.role === "ADMIN" ? "destructive" : "secondary"}
              >
                {profile.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">Account Details</h3>
              <p className="text-sm text-muted-foreground">
                Member since{" "}
                {formatDistanceToNow(new Date(profile.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated{" "}
                {formatDistanceToNow(new Date(profile.updatedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Balance</h3>
              <p className="text-2xl font-bold">
                ${profile.balance.toFixed(2)}
              </p>
            </div>
            <form action={updateProfile} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={profile.name || ""}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={profile.email}
                />
              </div>
              <Button type="submit">Update Profile</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
