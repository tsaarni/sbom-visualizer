import { Sbom, type SbomPackage, type SbomRelationship } from './sbom';

// Spdx is SBOM generated from SPDX tag/value format files.
export class Spdx extends Sbom {
  private packages: SbomPackage[] = [];
  private relationships: SbomRelationship[] = [];

  public parseTagValue(doc: string) {
    let currentPackage: SbomPackage;

    doc.split('\n').forEach((line) => {
      if (line.startsWith('PackageName: ')) {
        // Start of new package.
        currentPackage = this.getOrCreatePackage(line.split(' ')[1]);
      } else if (currentPackage && line.startsWith('SPDXID: ')) {
        // Add SPDX ID to currently processed package.
        currentPackage.id = line.split(' ')[1];
      } else if (currentPackage && line.startsWith('Relationship: ')) {
        // Add relationship to currently processed package.
        const parts = line.split(' ');
        if (parts[2] === 'DEPENDS_ON') {
          this.relationships.push({
            source: currentPackage,
            target: this.getOrCreatePackage(parts[3]),
          });
        }
      }
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

  private getOrCreatePackage(id: string): SbomPackage {
    let pkg = this.packages.find((p) => p.id === id);
    if (!pkg) {
      pkg = {
        name: id,
        id: id,
      };
      this.packages.push(pkg);
    }
    return pkg;
  }
}
