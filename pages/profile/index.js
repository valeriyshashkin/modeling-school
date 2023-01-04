import Head from "next/head";
import Content from "../../components/Content";
import Header from "../../components/Header";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import Link from "next/link";
import Image from "next/image";
import { formatRelative } from "date-fns";
import russianLocale from "date-fns/locale/ru";
import ReactLinkify from "react-linkify";
import {
  ArchiveBoxXMarkIcon,
  Cog6ToothIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function Profile() {
  const { isLoading, session, supabaseClient } = useSessionContext();
  const router = useRouter();
  const [_origin, setOrigin] = useState("");

  const { data: user } = useSWR(
    !isLoading && session ? api(`user`, session, { user: true }) : null,
    fetcher
  );

  const { data, mutate } = useSWR(
    !isLoading && session
      ? api(
          `archive?select=*,posts(text,created_at,id,groups(name,id))`,
          session
        )
      : null,
    fetcher
  );

  const removeFromArchive = async (id) => {
    mutate(
      data.filter((p) => p.id !== id),
      false
    );
    await supabaseClient.from("archive").delete().eq("id", id);
  };

  const sharePost = (id) => {
    navigator.share({ url: `${origin}/post/${id}` });
  };

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/");
    }
  }, [isLoading, session, router]);

  useEffect(() => {
    setOrigin(origin);
  }, []);

  if (isLoading || !session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Профиль - Школа моделирования</title>
      </Head>
      <Content>
        <Header home archivePage />
        <div className="text-xl font-bold pl-4 pb-4 bg-neutral-900 rounded-b-2xl mb-2">
          Профиль
        </div>
        <div className="bg-neutral-900 rounded-2xl relative">
          <div className="flex justify-center pt-4">
            {user ? (
              user?.user_metadata?.picture ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_BUCKET}/profile/${user.user_metadata.picture}`}
                  width={100}
                  height={100}
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="w-[100px] h-[100px] bg-neutral-800 rounded-full flex justify-center">
                  <QuestionMarkCircleIcon className="w-14" />
                </div>
              )
            ) : (
              <div className="bg-neutral-800 w-[100px] h-[100px] rounded-full"></div>
            )}
          </div>
          <div className="flex mt-2 pb-4 items-center justify-center">
            <div className="text-lg line-clamp-1 text-center">
              {user ? (
                user?.user_metadata?.name || "Неизвестный пользователь"
              ) : (
                <div className="bg-neutral-800 text-lg w-40 rounded-2xl">
                  &nbsp;
                </div>
              )}
            </div>
          </div>
          <Link href="/profile/settings">
            <a className="absolute top-2 right-2 sm:hover:bg-neutral-700 p-2 rounded-full">
              <Cog6ToothIcon className="w-6" />
            </a>
          </Link>
        </div>
        <div className="space-y-2 mb-8">
          {data ? (
            data.length === 0 ? (
              <div className="text-center text-neutral-500 mt-10">
                Нет сохраненных записей
              </div>
            ) : (
              data.map((p) => (
                <div
                  className="bg-neutral-900 rounded-2xl py-1 px-4"
                  key={p.id}
                >
                  <div>
                    <div className="flex gap-4">
                      <Link href={`/group/${p.posts.groups.id}?from=archive`}>
                        <a className="mt-4 ml-2">
                          <Image
                            alt=""
                            width={30}
                            height={30}
                            src={`https://avatars.dicebear.com/api/identicon/${p.posts.groups.id}.svg`}
                          />
                        </a>
                      </Link>
                      <div>
                        <Link href={`/group/${p.posts.groups.id}?from=archive`}>
                          <a className="mt-2 inline-block">
                            {p.posts.groups.name}
                          </a>
                        </Link>
                        <div className="text-neutral-500">
                          {formatRelative(
                            new Date(p.posts.created_at),
                            new Date(),
                            {
                              locale: russianLocale,
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2 rounded-2xl pr-6 whitespace-pre-wrap">
                      <ReactLinkify
                        componentDecorator={(href, text, key) =>
                          href.startsWith(_origin) ? (
                            <Link href={`${href}?from=archive`} key={key}>
                              <a className="text-blue-500">{text}</a>
                            </Link>
                          ) : (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={href}
                              key={key}
                              className="text-blue-500"
                            >
                              {text}
                            </a>
                          )
                        }
                      >
                        {p.posts.text}
                      </ReactLinkify>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2 mt-2">
                    <button
                      title="Удалить из архива"
                      onClick={() => removeFromArchive(p.id)}
                      className="p-2 -m-2 sm:hover:bg-neutral-700 rounded-full"
                    >
                      <ArchiveBoxXMarkIcon className="w-6" />
                    </button>
                    <button
                      title="Поделиться записью"
                      onClick={() => sharePost(p.post_id)}
                      className="p-2 -m-2 ml-2 sm:hover:bg-neutral-700 rounded-full"
                    >
                      <LinkIcon className="w-6" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-2 mt-2">
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
            </div>
          )}
        </div>
      </Content>
    </>
  );
}
