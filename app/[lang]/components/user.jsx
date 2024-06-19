import { User } from "@nextui-org/user";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import Link from "next/link";
import { Link as UILink } from "@nextui-org/link";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";

export function HeaderUser({ user, dictionary }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onMouseLeave={() => setIsOpen(false)}
        >
            <PopoverTrigger>
                <div>
                    <div className="hidden md:block">
                        <User
                            name={user?.nickname}
                            description={user?.email}
                            avatarProps={{ src: user?.picture }}
                            onMouseOver={() => setIsOpen(true)}
                        />
                    </div>
                    <div className="md:hidden">
                        <Avatar
                            onMouseOver={() => setIsOpen(true)}
                            src={user?.picture} />
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <Listbox>
                    <ListboxSection>
                        <ListboxItem>
                            <UILink>
                                <Link href='/me'>{dictionary.HeaderUser.profile}</Link>
                            </UILink>
                        </ListboxItem>
                    </ListboxSection>
                    <ListboxSection>
                        <ListboxItem>
                            <UILink color="danger" href="/api/auth/logout">
                                {/* Next <Link> preloads */}
                                {dictionary.HeaderUser.logout}
                            </UILink>
                        </ListboxItem>
                    </ListboxSection>
                </Listbox>
            </PopoverContent>
        </Popover>
    );
}