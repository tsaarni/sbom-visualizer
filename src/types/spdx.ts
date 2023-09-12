export interface SpdxPackage {
  name: string;
  spdxId: string;
}

interface SpdxRelationship {
  type: string; // DEPENDS_ON / DESCRIBES
  spdxElementId: string; // SPDXID of origin
  relatedSpdxElement: string; // SPDXID of target
}

export class SpdxDocument {
  private packages: SpdxPackage[] = [];
  private relationships: SpdxRelationship[] = [];

  constructor() {}

  parseTagValue(doc: string) {
    let currentPackage: SpdxPackage;

    doc.split('\n').forEach((line) => {
      // Is this a start of new package?
      if (line.startsWith('PackageName: ')) {
        // If we were already parsing a package, it is now considered complete and we can add it to the list.
        if (currentPackage) {
          this.packages.push(currentPackage);
        }

        // Start parsing a new package.
        currentPackage = {
          name: line.split(' ')[1],
          spdxId: '',
        };
      } else if (currentPackage && line.startsWith('SPDXID: ')) {
        currentPackage.spdxId = line.split(' ')[1];
      } else if (currentPackage && line.startsWith('Relationship: ')) {
        const parts = line.split(' ');
        this.relationships.push({
          type: parts[2],
          spdxElementId: parts[1],
          relatedSpdxElement: parts[3],
        });
      }
    });
  }

  getRootPackage(): SpdxPackage {
    return this.packages[0];
  }

  getChildPackages(pkg: SpdxPackage): SpdxPackage[] {
    return this.relationships // Iterate over all relationships.
      .filter((r) => r.spdxElementId === pkg.spdxId) // Pick relationships where pkg is the origin.
      .filter((r) => r.type === 'DEPENDS_ON') // Pick relationships of type DEPENDS_ON.
      .map((r) => this.packages.find((p) => p.spdxId === r.relatedSpdxElement)) // Find the target package.
      .filter((p) => p !== undefined) as SpdxPackage[]; // Filter out undefined values.
  }
}
