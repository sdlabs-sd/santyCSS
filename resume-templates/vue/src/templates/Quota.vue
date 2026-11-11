<script setup>
import { dateRange } from '@shared/format.js';
import { A, contacts, has, templateProps, useResume } from './parts.js';

/** Quota — Sales Executive. Results first: attainment and deal stats up top. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-gray-50 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
    <article class="max-width-960 center-margin background-white add-shadow-lg round-corners-12 overflow-hidden print:no-shadow">
      <div :class="'set-height-8 ' + accent.solid" />
      <header class="add-padding-40 on-mobile:add-padding-24 make-flex flex-wrap justify-between align-end gap-24">
        <div>
          <h1 class="set-text-44 on-mobile:set-text-32 text-extrabold color-gray-900 line-height-tight letter-space-tight">{{ basics.name }}</h1>
          <p :class="'set-text-18 text-bold add-margin-top-6 ' + accent.text">{{ basics.title }}</p>
        </div>
        <ul class="list-none add-padding-0 add-margin-0 set-text-14 text-right on-mobile:text-left">
          <li v-for="c in contacts(basics)" :key="c.key" class="add-margin-bottom-2"><A :href="c.href" class="color-gray-600 text-no-decoration on-hover:color-gray-900">{{ c.label }}</A></li>
          <li v-for="l in links" :key="l.url"><A :href="l.url" :class="'text-semibold text-no-decoration ' + accent.text">{{ l.label }}</A></li>
        </ul>
      </header>

      <div v-if="has(stats)" :class="'make-grid grid-cols-2 md:grid-cols-4 color-white ' + accent.deep">
        <div v-for="(s, i) in stats" :key="s.label" :class="'add-padding-24 ' + (i % 2 ? '' : accent.strong)">
          <p class="set-text-36 text-extrabold line-height-tight">{{ s.value }}</p>
          <p :class="'set-text-13 text-semibold add-margin-top-4 ' + accent.textLight">{{ s.label }}</p>
        </div>
      </div>

      <div class="add-padding-40 on-mobile:add-padding-24">
        <p v-if="basics.summary" class="set-text-16 color-gray-700 line-height-relaxed add-margin-bottom-32 add-border-left-4 add-padding-left-16 border-color-gray-200 text-italic">{{ basics.summary }}</p>

        <section v-if="has(experience)" class="add-margin-bottom-32">
          <h2 class="set-text-13 text-extrabold text-uppercase letter-space-widest color-gray-900 add-margin-bottom-16 make-flex align-center gap-12">Track record<span class="flex-1 set-height-1 background-gray-200" /></h2>
          <div v-for="(x, i) in experience" :key="i" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 gap-y-4 add-margin-bottom-20 break-inside-avoid">
            <div>
              <p class="set-text-13 text-bold color-gray-500">{{ dateRange(x.start, x.end) }}</p>
              <p class="set-text-13 color-gray-400">{{ x.location }}</p>
            </div>
            <div class="md:span-col-3">
              <h3 class="set-text-17 text-bold color-gray-900">{{ x.role }} · <span :class="accent.text">{{ x.company }}</span></h3>
              <ul class="list-none add-padding-0 add-margin-0 add-margin-top-8">
                <li v-for="(h, j) in x.highlights" :key="j" class="make-flex gap-10 set-text-14 color-gray-700 line-height-relaxed add-margin-bottom-6">
                  <span :class="'text-bold flex-shrink-0 ' + accent.text">▲</span><span>{{ h }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div class="make-grid grid-cols-1 md:grid-cols-2 gap-x-32">
          <section v-if="has(skills)" class="add-margin-bottom-24">
            <h2 class="set-text-13 text-extrabold text-uppercase letter-space-widest color-gray-900 add-margin-bottom-16 make-flex align-center gap-12">Selling skills<span class="flex-1 set-height-1 background-gray-200" /></h2>
            <div class="make-flex flex-wrap gap-8">
              <span v-for="s in skills" :key="s.name" :class="'set-text-13 text-semibold add-padding-x-12 add-padding-y-6 round-corners-6 add-border-1 ' + accent.borderSoft + ' ' + accent.textStrong">{{ s.name }}</span>
            </div>
          </section>
          <section class="add-margin-bottom-24">
            <h2 class="set-text-13 text-extrabold text-uppercase letter-space-widest color-gray-900 add-margin-bottom-16 make-flex align-center gap-12">Education &amp; more<span class="flex-1 set-height-1 background-gray-200" /></h2>
            <p v-for="(e, i) in education" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-6"><span class="text-bold">{{ e.degree }}</span>, {{ e.school }} ({{ e.end }})</p>
            <p v-for="(c, i) in certifications" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-6">{{ c.name }} · {{ c.year }}</p>
            <p v-if="has(languages)" class="set-text-14 color-gray-700">{{ languages.map(l => l.name + ' (' + l.level + ')').join(' · ') }}</p>
            <p v-for="(p, i) in projects" :key="i" class="set-text-14 color-gray-700 add-margin-top-6"><span class="text-bold">{{ p.name }}</span> — {{ p.description }}</p>
          </section>
        </div>
      </div>
    </article>
  </main>
</template>
