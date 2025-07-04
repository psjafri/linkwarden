import {
  AccountSettings,
  CollectionIncludingMembersAndLinkCount,
  Sort,
  ViewMode,
} from "@linkwarden/types";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import ProfilePhoto from "@/components/ProfilePhoto";
import usePermissions from "@/hooks/usePermissions";
import NoLinksFound from "@/components/NoLinksFound";
import getPublicUserData from "@/lib/client/getPublicUserData";
import EditCollectionModal from "@/components/ModalContent/EditCollectionModal";
import EditCollectionSharingModal from "@/components/ModalContent/EditCollectionSharingModal";
import DeleteCollectionModal from "@/components/ModalContent/DeleteCollectionModal";
import NewCollectionModal from "@/components/ModalContent/NewCollectionModal";
import getServerSideProps from "@/lib/client/getServerSideProps";
import { useTranslation } from "next-i18next";
import LinkListOptions from "@/components/LinkListOptions";
import { useCollections } from "@linkwarden/router/collections";
import { useUser } from "@linkwarden/router/user";
import { useLinks } from "@linkwarden/router/links";
import Links from "@/components/LinkViews/Links";
import Icon from "@/components/Icon";
import CollectionCard from "@/components/CollectionCard";
import { IconWeight } from "@phosphor-icons/react";
import PageHeader from "@/components/PageHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: collections = [] } = useCollections();

  const [sortBy, setSortBy] = useState<Sort>(
    Number(localStorage.getItem("sortBy")) ?? Sort.DateNewestFirst
  );

  const { links, data } = useLinks({
    sort: sortBy,
    collectionId: Number(router.query.id),
  });

  const [activeCollection, setActiveCollection] =
    useState<CollectionIncludingMembersAndLinkCount>();

  const permissions = usePermissions(activeCollection?.id as number);

  useEffect(() => {
    setActiveCollection(
      collections.find((e) => e.id === Number(router.query.id))
    );
  }, [router, collections]);

  const { data: user } = useUser();

  const [collectionOwner, setCollectionOwner] = useState<
    Partial<AccountSettings>
  >({});

  useEffect(() => {
    const fetchOwner = async () => {
      if (activeCollection && activeCollection.ownerId !== user?.id) {
        const owner = await getPublicUserData(
          activeCollection.ownerId as number
        );
        setCollectionOwner(owner);
      } else if (activeCollection && activeCollection.ownerId === user?.id) {
        setCollectionOwner({
          id: user?.id as number,
          name: user?.name,
          username: user?.username as string,
          image: user?.image as string,
          archiveAsScreenshot: user?.archiveAsScreenshot as boolean,
          archiveAsMonolith: user?.archiveAsMonolith as boolean,
          archiveAsPDF: user?.archiveAsPDF as boolean,
        });
      }
    };

    fetchOwner();
  }, [activeCollection]);

  const [editCollectionModal, setEditCollectionModal] = useState(false);
  const [newCollectionModal, setNewCollectionModal] = useState(false);
  const [editCollectionSharingModal, setEditCollectionSharingModal] =
    useState(false);
  const [deleteCollectionModal, setDeleteCollectionModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (editMode) return setEditMode(false);
  }, [router]);

  const [viewMode, setViewMode] = useState<ViewMode>(
    (localStorage.getItem("viewMode") as ViewMode) || ViewMode.Card
  );

  return (
    <MainLayout>
      <div
        className="p-5 flex gap-3 flex-col"
        style={{
          backgroundImage: `linear-gradient(${activeCollection?.color}20 0%, ${
            user?.theme === "dark" ? "#262626" : "#f3f4f6"
          } 13rem, ${user?.theme === "dark" ? "#171717" : "#ffffff"} 100%)`,
        }}
      >
        {activeCollection && (
          <div className="flex gap-3 items-start justify-between">
            <div className="flex items-center gap-2">
              {activeCollection.icon ? (
                <Icon
                  icon={activeCollection.icon}
                  size={45}
                  weight={
                    (activeCollection.iconWeight || "regular") as IconWeight
                  }
                  color={activeCollection.color}
                />
              ) : (
                <i
                  className="bi-folder-fill text-3xl"
                  style={{ color: activeCollection.color }}
                />
              )}

              <p className="sm:text-3xl text-2xl w-full py-1 break-words hyphens-auto font-thin">
                {activeCollection?.name}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="mt-2 text-neutral"
                  onMouseDown={(e) => e.preventDefault()}
                  title={t("more")}
                >
                  <i className="bi-three-dots text-xl" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                sideOffset={4}
                align="end"
                className="bg-base-200 border border-neutral-content rounded-box p-1"
              >
                <DropdownMenuItem
                  onClick={() => {
                    for (const link of links) {
                      if (link.url) window.open(link.url, "_blank");
                    }
                  }}
                >
                  <i className="bi-box-arrow-up-right" />
                  {t("open_all_links")}
                </DropdownMenuItem>

                {permissions === true && (
                  <DropdownMenuItem
                    onClick={() => setEditCollectionModal(true)}
                  >
                    <i className="bi-pencil-square" />
                    {t("edit_collection_info")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => setEditCollectionSharingModal(true)}
                >
                  <i className="bi-globe" />
                  {permissions === true
                    ? t("share_and_collaborate")
                    : t("view_team")}
                </DropdownMenuItem>

                {permissions === true && (
                  <DropdownMenuItem onClick={() => setNewCollectionModal(true)}>
                    <i className="bi-folder-plus" />
                    {t("create_subcollection")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setDeleteCollectionModal(true)}
                  className="text-error"
                >
                  {permissions === true ? (
                    <>
                      <i className="bi-trash" />
                      {t("delete_collection")}
                    </>
                  ) : (
                    <>
                      <i className="bi-box-arrow-left" />
                      {t("leave_collection")}
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {activeCollection && (
          <div className="min-w-[15rem]">
            <div className="flex gap-1 justify-center sm:justify-end items-center w-fit">
              <div
                className="flex items-center px-1 py-1 rounded-full cursor-pointer hover:bg-base-content/20 transition-colors duration-200"
                onClick={() => setEditCollectionSharingModal(true)}
              >
                {collectionOwner.id && (
                  <ProfilePhoto
                    src={collectionOwner.image || undefined}
                    name={collectionOwner.name}
                  />
                )}
                {activeCollection.members
                  .sort((a, b) => (a.userId as number) - (b.userId as number))
                  .map((e, i) => {
                    return (
                      <ProfilePhoto
                        key={i}
                        src={e.user.image ? e.user.image : undefined}
                        name={e.user.name}
                        className="-ml-3"
                      />
                    );
                  })
                  .slice(0, 3)}
                {activeCollection.members.length - 3 > 0 && (
                  <div className={`avatar drop-shadow-md placeholder -ml-3`}>
                    <div className="bg-base-100 text-neutral rounded-full w-8 h-8 ring-2 ring-neutral-content">
                      <span>+{activeCollection.members.length - 3}</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-neutral text-sm ml-2">
                {activeCollection.members.length > 0
                  ? activeCollection.members.length === 1
                    ? t("by_author_and_other", {
                        author: collectionOwner.name,
                        count: activeCollection.members.length,
                      })
                    : t("by_author_and_others", {
                        author: collectionOwner.name,
                        count: activeCollection.members.length,
                      })
                  : t("by_author", { author: collectionOwner.name })}
              </p>
            </div>
          </div>
        )}

        {activeCollection?.description && <p>{activeCollection.description}</p>}

        <Separator />

        {collections.some((e) => e.parentId === activeCollection?.id) && (
          <>
            <PageHeader
              icon="bi-folder"
              title={t("collections")}
              description={t(
                collections.filter((e) => e.parentId === activeCollection?.id)
                  .length === 1
                  ? "showing_count_result"
                  : "showing_count_results",
                {
                  count: collections.filter(
                    (e) => e.parentId === activeCollection?.id
                  ).length,
                }
              )}
              className="scale-90 w-fit"
            />
            <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {collections
                .filter((e) => e.parentId === activeCollection?.id)
                .map((e) => (
                  <CollectionCard key={e.id} collection={e} />
                ))}
            </div>
          </>
        )}

        <LinkListOptions
          t={t}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          editMode={
            permissions === true ||
            permissions?.canUpdate ||
            permissions?.canDelete
              ? editMode
              : undefined
          }
          setEditMode={
            permissions === true ||
            permissions?.canUpdate ||
            permissions?.canDelete
              ? setEditMode
              : undefined
          }
          links={links}
        >
          {collections.some((e) => e.parentId === activeCollection?.id) ? (
            <PageHeader
              icon={"bi-link-45deg"}
              title={t("links")}
              description={
                activeCollection?._count?.links === 1
                  ? t("showing_count_result", {
                      count: activeCollection?._count?.links,
                    })
                  : t("showing_count_results", {
                      count: activeCollection?._count?.links,
                    })
              }
              className="scale-90 w-fit"
            />
          ) : (
            <p>
              {activeCollection?._count?.links === 1
                ? t("showing_count_result", {
                    count: activeCollection?._count?.links,
                  })
                : t("showing_count_results", {
                    count: activeCollection?._count?.links,
                  })}
            </p>
          )}
        </LinkListOptions>

        <Links
          editMode={editMode}
          links={links}
          layout={viewMode}
          placeholderCount={1}
          useData={data}
        />
        {!data.isLoading && links && !links[0] && <NoLinksFound />}
      </div>
      {activeCollection && (
        <>
          {editCollectionModal && (
            <EditCollectionModal
              onClose={() => setEditCollectionModal(false)}
              activeCollection={activeCollection}
            />
          )}
          {editCollectionSharingModal && (
            <EditCollectionSharingModal
              onClose={() => setEditCollectionSharingModal(false)}
              activeCollection={activeCollection}
            />
          )}
          {newCollectionModal && (
            <NewCollectionModal
              onClose={() => setNewCollectionModal(false)}
              parent={activeCollection}
            />
          )}
          {deleteCollectionModal && (
            <DeleteCollectionModal
              onClose={() => setDeleteCollectionModal(false)}
              activeCollection={activeCollection}
            />
          )}
        </>
      )}
    </MainLayout>
  );
}

export { getServerSideProps };
