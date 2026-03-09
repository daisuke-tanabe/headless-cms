| name | description |
|------|-------------|
| cloud-infrastructure-security | クラウドプラットフォームへのデプロイ・インフラ設定・IAM ポリシー管理・ログ/モニタリングのセットアップ・CI/CD パイプラインの実装時に使用する。ベストプラクティスに沿ったクラウドセキュリティチェックリストを提供する。 |

# クラウド & インフラセキュリティスキル

このスキルは、クラウドインフラ・CI/CD パイプライン・デプロイ設定がセキュリティのベストプラクティスに従い、業界標準に準拠していることを確実にする。

## 発動タイミング

- クラウドプラットフォームにアプリケーションをデプロイするとき（AWS・Vercel・Railway・Cloudflare）
- IAM ロールと権限を設定するとき
- CI/CD パイプラインをセットアップするとき
- Infrastructure as Code を実装するとき（Terraform・CloudFormation）
- ログとモニタリングを設定するとき
- クラウド環境でシークレットを管理するとき
- CDN とエッジセキュリティをセットアップするとき
- ディザスタリカバリとバックアップ戦略を実装するとき

## クラウドセキュリティチェックリスト

### 1. IAM とアクセス制御

#### 最小権限の原則

```yaml
# ✅ 正しい: 最小限の権限
iam_role:
  permissions:
    - s3:GetObject  # 読み取りアクセスのみ
    - s3:ListBucket
  resources:
    - arn:aws:s3:::my-bucket/*  # 特定のバケットのみ

# ❌ 誤り: 過度に広い権限
iam_role:
  permissions:
    - s3:*  # 全ての S3 アクション
  resources:
    - "*"  # 全リソース
```

#### 多要素認証（MFA）

```bash
# root/管理者アカウントには常に MFA を有効にする
aws iam enable-mfa-device \
  --user-name admin \
  --serial-number arn:aws:iam::123456789:mfa/admin \
  --authentication-code1 123456 \
  --authentication-code2 789012
```

#### 確認ステップ

- [ ] 本番環境で root アカウントを使用していない
- [ ] 全ての特権アカウントで MFA が有効
- [ ] サービスアカウントは長期クレデンシャルではなくロールを使用
- [ ] IAM ポリシーが最小権限に従っている
- [ ] 定期的なアクセスレビューが実施されている
- [ ] 未使用のクレデンシャルが削除または無効化されている

### 2. シークレット管理

#### クラウドシークレットマネージャー

```typescript
// ✅ 正しい: クラウドシークレットマネージャーを使用
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'prod/api-key' });
const apiKey = JSON.parse(secret.SecretString).key;

// ❌ 誤り: 環境変数のみにハードコードまたは保存
const apiKey = process.env.API_KEY; // ローテーションなし・監査なし
```

#### シークレットのローテーション

```bash
# データベース認証情報の自動ローテーションを設定
aws secretsmanager rotate-secret \
  --secret-id prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate \
  --rotation-rules AutomaticallyAfterDays=30
```

#### 確認ステップ

- [ ] 全シークレットがクラウドシークレットマネージャーに保存されている（AWS Secrets Manager・Vercel Secrets）
- [ ] データベース認証情報の自動ローテーションが有効
- [ ] API キーが少なくとも四半期ごとにローテーションされる
- [ ] コード・ログ・エラーメッセージにシークレットがない
- [ ] シークレットアクセスの監査ログが有効

### 3. ネットワークセキュリティ

#### VPC とファイアウォール設定

```terraform
# ✅ 正しい: 制限されたセキュリティグループ
resource "aws_security_group" "app" {
  name = "app-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # 内部 VPC のみ
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTPS アウトバウンドのみ
  }
}

# ❌ 誤り: インターネットに開放
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 全ポート・全 IP！
  }
}
```

#### 確認ステップ

- [ ] データベースが公開アクセス不可
- [ ] SSH/RDP ポートが VPN/踏み台サーバーのみに制限されている
- [ ] セキュリティグループが最小権限に従っている
- [ ] ネットワーク ACL が設定されている
- [ ] VPC フローログが有効

### 4. ログとモニタリング

#### CloudWatch/ログ設定

```typescript
// ✅ 正しい: 包括的なログ記録
import { CloudWatchLogsClient, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

const logSecurityEvent = async (event: SecurityEvent) => {
  await cloudwatch.putLogEvents({
    logGroupName: '/aws/security/events',
    logStreamName: 'authentication',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify({
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        result: event.result,
        // 機密データは絶対にログに記録しない
      })
    }]
  });
};
```

#### 確認ステップ

- [ ] 全サービスで CloudWatch/ログが有効
- [ ] 認証失敗がログに記録されている
- [ ] 管理者アクションが監査されている
- [ ] ログの保持期間が設定されている（コンプライアンス要件で 90 日以上）
- [ ] 不審な活動に対するアラートが設定されている
- [ ] ログが集約されており改ざん防止されている

### 5. CI/CD パイプラインセキュリティ

#### セキュアなパイプライン設定

```yaml
# ✅ 正しい: セキュアな GitHub Actions ワークフロー
name: デプロイ

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read  # 最小限の権限

    steps:
      - uses: actions/checkout@v4

      # シークレットスキャン
      - name: シークレットスキャン
        uses: trufflesecurity/trufflehog@main

      # 依存関係の監査
      - name: 依存関係の監査
        run: npm audit --audit-level=high

      # 長期トークンではなく OIDC を使用
      - name: AWS 認証情報を設定
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
```

#### サプライチェーンセキュリティ

```json
// package.json - ロックファイルと整合性チェックを使用
{
  "scripts": {
    "install": "npm ci",  // 再現可能なビルドのために ci を使用
    "audit": "npm audit --audit-level=moderate",
    "check": "npm outdated"
  }
}
```

#### 確認ステップ

- [ ] 長期クレデンシャルの代わりに OIDC が使用されている
- [ ] パイプラインでシークレットスキャンが実施されている
- [ ] 依存関係の脆弱性スキャンが実施されている
- [ ] コンテナイメージスキャンが実施されている（該当する場合）
- [ ] ブランチ保護ルールが適用されている
- [ ] マージ前にコードレビューが必要
- [ ] 署名済みコミットが強制されている

### 6. Cloudflare と CDN セキュリティ

#### Cloudflare セキュリティ設定

```typescript
// ✅ 正しい: セキュリティヘッダー付きの Cloudflare Workers
export default {
  async fetch(request: Request): Promise<Response> {
    const response = await fetch(request);

    // セキュリティヘッダーを追加
    const headers = new Headers(response.headers);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=()');

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};
```

#### WAF ルール

```bash
# Cloudflare WAF マネージドルールを有効にする
# - OWASP コアルールセット
# - Cloudflare マネージドルールセット
# - レート制限ルール
# - ボット保護
```

#### 確認ステップ

- [ ] OWASP ルールで WAF が有効
- [ ] レート制限が設定されている
- [ ] ボット保護が有効
- [ ] DDoS 保護が有効
- [ ] セキュリティヘッダーが設定されている
- [ ] SSL/TLS 厳格モードが有効

### 7. バックアップとディザスタリカバリ

#### 自動バックアップ

```terraform
# ✅ 正しい: 自動 RDS バックアップ
resource "aws_db_instance" "main" {
  allocated_storage     = 20
  engine               = "postgres"

  backup_retention_period = 30  # 30 日間保持
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = true  # 誤った削除を防止
}
```

#### 確認ステップ

- [ ] 毎日の自動バックアップが設定されている
- [ ] バックアップ保持期間がコンプライアンス要件を満たしている
- [ ] ポイントインタイムリカバリが有効
- [ ] バックアップテストが四半期ごとに実施されている
- [ ] ディザスタリカバリ計画が文書化されている
- [ ] RPO と RTO が定義されテスト済み

## 本番クラウドデプロイ前チェックリスト

本番クラウドへのデプロイ前に:

- [ ] **IAM**: root アカウント未使用・MFA 有効・最小権限ポリシー
- [ ] **シークレット**: 全シークレットがローテーション付きクラウドシークレットマネージャーに保存
- [ ] **ネットワーク**: セキュリティグループが制限されている・公開データベースなし
- [ ] **ログ**: 保持期間付き CloudWatch/ログが有効
- [ ] **モニタリング**: 異常に対するアラートが設定されている
- [ ] **CI/CD**: OIDC 認証・シークレットスキャン・依存関係監査
- [ ] **CDN/WAF**: OWASP ルールで Cloudflare WAF が有効
- [ ] **暗号化**: 保存時と転送時のデータが暗号化されている
- [ ] **バックアップ**: テスト済みリカバリを含む自動バックアップ
- [ ] **コンプライアンス**: GDPR/HIPAA 要件を満たしている（該当する場合）
- [ ] **ドキュメント**: インフラが文書化されランブックが作成されている
- [ ] **インシデント対応**: セキュリティインシデント計画が策定されている

## よくあるクラウドセキュリティの設定ミス

### S3 バケットの公開

```bash
# ❌ 誤り: 公開バケット
aws s3api put-bucket-acl --bucket my-bucket --acl public-read

# ✅ 正しい: 特定のアクセスを持つプライベートバケット
aws s3api put-bucket-acl --bucket my-bucket --acl private
aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json
```

### RDS の公開アクセス

```terraform
# ❌ 誤り
resource "aws_db_instance" "bad" {
  publicly_accessible = true  # 絶対にしてはいけない！
}

# ✅ 正しい
resource "aws_db_instance" "good" {
  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.db.id]
}
```

## 参考リソース

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security/)
- [OWASP Cloud Security](https://owasp.org/www-project-cloud-security/)
- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)

**注意**: クラウドの設定ミスはデータ侵害の主要な原因です。1 つの公開 S3 バケットや過度に許可された IAM ポリシーがインフラ全体を危険にさらす可能性があります。常に最小権限の原則と多層防御に従ってください。
