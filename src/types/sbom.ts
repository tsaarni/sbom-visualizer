// Sbom is an abstract call for parsers that generate SBOMs.
export abstract class Sbom {
  abstract getRootPackage(): SbomPackage;
  abstract getPackages(): SbomPackage[];
  abstract getRelationships(): SbomRelationship[];
}

export interface SbomPackage {
  name: string;
  id: string;
}

export interface SbomRelationship {
  source: SbomPackage;
  target: SbomPackage;
}
