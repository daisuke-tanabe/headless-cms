# CLAUDE.md

## プロジェクト概要

AI CMS プロジェクト。

## コンテキスト管理

- 50% のコンテキスト消費で /compact を実行する
- 複雑なタスクは 50% 以内で完了するサブタスクに分割する
- 各タスク完了後にこまめにコミットする

## 作業フロー

- 実装前に /plan モードで設計を確認する
- 変更後は pnpm test / pnpm lint で検証する
- コミットは /commit スキルで論理的な単位ごとに作成する

## コーディングガイドライン

@docs/coding-guidelines/principles.md
@docs/coding-guidelines/javascript-typescript.md
