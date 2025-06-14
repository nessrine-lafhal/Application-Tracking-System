import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Ahmed Mansouri</p>
          <p className="text-sm text-muted-foreground">ahmed.mansouri@email.com</p>
        </div>
        <div className="ml-auto font-medium">Développeur Full Stack</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>SB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Sophie Berrada</p>
          <p className="text-sm text-muted-foreground">sophie.berrada@email.com</p>
        </div>
        <div className="ml-auto font-medium">UX Designer</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>YT</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Youssef Tazi</p>
          <p className="text-sm text-muted-foreground">youssef.tazi@email.com</p>
        </div>
        <div className="ml-auto font-medium">Data Scientist</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Leila Moussaoui</p>
          <p className="text-sm text-muted-foreground">leila.moussaoui@email.com</p>
        </div>
        <div className="ml-auto font-medium">Chef de Projet</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>KB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Karim Benali</p>
          <p className="text-sm text-muted-foreground">karim.benali@email.com</p>
        </div>
        <div className="ml-auto font-medium">Développeur Mobile</div>
      </div>
    </div>
  )
}
