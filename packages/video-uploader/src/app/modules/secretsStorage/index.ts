import * as sodium from "libsodium-wrappers";
import { Octokit } from "@octokit/rest";

export interface Repository {
  owner: string;
  name: string;
}

export default class SecretsStorage {
  readonly #octokit;

  readonly #repository;

  constructor(token: string, repository: Repository) {
    this.#octokit = new Octokit({ auth: token });
    this.#repository = repository;
  }

  public async set(name: string, value: string): Promise<void> {
    const { data: repoPublicKey } = await this.#octokit.actions.getRepoPublicKey({
      owner: this.#repository.owner,
      repo: this.#repository.name,
    });

    await sodium.ready;

    const binaryPublicKey = sodium.from_base64(repoPublicKey.key, sodium.base64_variants.ORIGINAL);
    const binarySecret = sodium.from_string(value);
    const encryptedSecret = sodium.crypto_box_seal(binarySecret, binaryPublicKey);
    const encryptedSecretValue = sodium.to_base64(encryptedSecret, sodium.base64_variants.ORIGINAL);

    await this.#octokit.actions.createOrUpdateRepoSecret({
      owner: this.#repository.owner,
      repo: this.#repository.name,
      secret_name: name,
      encrypted_value: encryptedSecretValue,
      key_id: repoPublicKey.key_id,
    });
  }
}
