import { Sbom, type SbomPackage, type SbomRelationship } from './sbom';

// GoModGraph is SBOM generated from the go mod graph command.
export class GoModGraph extends Sbom {
  private packages: SbomPackage[] = [];
  private relationships: SbomRelationship[] = [];

  public parse(doc: string): void {
    doc.split('\n').forEach((line) => {
      if (line.length === 0) {
        return;
      }
      const parts = line.split(' ');
      const source = parts[0];
      const target = parts[1];
      const sourcePackage = this.getOrCreatePackage(source);
      const targetPackage = this.getOrCreatePackage(target);
      // Add relationship but only if it does not exist yet.
      if (
        this.relationships.find((r) => r.source === sourcePackage && r.target === targetPackage)
      ) {
        return;
      }

      this.relationships.push({
        source: sourcePackage,
        target: targetPackage,
      });
    });
  }

  public getRootPackage(): SbomPackage {
    return this.packages[0];
  }

  public getPackages(): SbomPackage[] {
    return this.packages;
  }

  public getRelationships(): SbomRelationship[] {
    return this.relationships;
  }

  private getOrCreatePackage(name: string): SbomPackage {
    // Split module@version
    const parts = name.split('@');
    const module = parts[0];
    let pkg = this.packages.find((p) => p.name === name);
    if (!pkg) {
      pkg = {
        name: module,
        id: module,
      };
      this.packages.push(pkg);
    }
    return pkg;
  }
}
