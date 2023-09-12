<template>
  <div>
    <input type="file" @change="onFileSelected" />
  </div>
  <div ref="diagram" style="width: 100%; height: 500px"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { SpdxDocument, type SpdxPackage } from '@/types/spdx';
  import * as echarts from 'echarts';

  // The data model for the SBOM diagram in ECharts tree format
  // https://echarts.apache.org/en/option.html#series-tree.data
  let model: any;

  let chart: echarts.ECharts;

  const diagram = ref<HTMLElement>();

  function onFileSelected(event: Event) {
    const el = event.target as HTMLInputElement;

    if (!el.files?.length) {
      console.log('No file selected');
      return;
    }

    // Pick the first file if multiple files are selected.
    const file: File = el.files[0];

    fetch(file.name).then((response) => {
      response.text().then((text) => {
        const doc = new SpdxDocument();
        doc.parseTagValue(text);
        model = createNode(doc, doc.getRootPackage(), []);
      });
    });
  }

  // Convert the SPDX data model to the ECharts tree data model.
  function createNode(doc: SpdxDocument, p: SpdxPackage, visited: SpdxPackage[]): any {
    const cycle = visited.includes(p);
    return {
      name: p.name,
      children: cycle
        ? []
        : doc.getChildPackages(p).map((p) => createNode(doc, p, visited.concat(p))),
    };
  }

  onMounted(() => {
    chart = echarts.init(diagram.value);
    chart.setOption({
      dataset: [{ source: model }],
      series: [
        {
          type: 'tree',
          dataSetIndex: 0,
        },
      ],
    });
  });
</script>
