import { CreateOrganization } from "@clerk/clerk-react"
import { PageContainer } from "@/components/page-container"

export function OrgRequiredPage() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">ワークスペースが必要です</h1>
          <p className="text-sm text-muted-foreground">
            利用を開始するには、ワークスペースを作成してください。
          </p>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/dashboard" skipInvitationScreen={true} />
      </div>
    </PageContainer>
  )
}
