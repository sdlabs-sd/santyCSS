<script setup>
import { dateRange } from '@shared/format.js';
import { A, contacts, has, templateProps, useResume } from './parts.js';

/** Ledger — Accountant. Conservative, ATS-friendly single column with ruled sections. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-gray-200 add-padding-y-40 on-mobile:add-padding-y-0">
    <article class="max-width-896 center-margin background-white add-shadow-md add-padding-56 on-mobile:add-padding-24 print:no-shadow">
      <header :class="'text-center add-padding-bottom-24 add-border-bottom-4 ' + accent.border">
        <h1 class="font-serif set-text-40 on-mobile:set-text-28 text-bold color-gray-900 letter-space-wide">{{ basics.name }}</h1>
        <p class="set-text-15 text-semibold text-uppercase letter-space-widest color-gray-600 add-margin-top-6">{{ basics.title }}</p>
        <p class="set-text-13 color-gray-600 add-margin-top-12">
          <span v-for="(c, i) in contacts(basics)" :key="c.key"><span v-if="i > 0" class="color-gray-300"> | </span><A :href="c.href" class="color-gray-600 text-no-decoration">{{ c.label }}</A></span>
          <span v-for="l in links" :key="l.url"><span class="color-gray-300"> | </span><A :href="l.url" class="color-gray-600 text-no-decoration">{{ l.label }}</A></span>
        </p>
      </header>

      <section v-if="basics.summary" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Profile</h2>
        <div class="md:span-col-3">
          <p class="set-text-14 color-gray-800 line-height-relaxed">{{ basics.summary }}</p>
        </div>
      </section>
      <section v-if="has(stats)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Key figures</h2>
        <div class="md:span-col-3">
          <div class="make-flex flex-wrap gap-24">
            <p v-for="s in stats" :key="s.label" class="set-text-14 color-gray-700"><span :class="'font-serif set-text-22 text-bold ' + accent.textStrong">{{ s.value }}</span> {{ s.label }}</p>
          </div>
        </div>
      </section>
      <section v-if="has(experience)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Experience</h2>
        <div class="md:span-col-3">
          <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-16">
            <div class="make-flex flex-wrap justify-between gap-8">
              <h3 class="set-text-15 text-bold color-gray-900">{{ x.role }}, {{ x.company }}</h3>
              <span class="set-text-13 color-gray-600 text-italic">{{ dateRange(x.start, x.end) }}</span>
            </div>
            <p v-if="x.location" class="set-text-13 color-gray-500">{{ x.location }}</p>
            <ul class="add-padding-left-20 add-margin-top-6 set-text-14 color-gray-800 line-height-relaxed">
              <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-2">{{ h }}</li>
            </ul>
          </div>
        </div>
      </section>
      <section v-if="has(education)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Education</h2>
        <div class="md:span-col-3">
          <div v-for="(e, i) in education" :key="i" class="make-flex flex-wrap justify-between gap-8 add-margin-bottom-8">
            <p class="set-text-14 color-gray-800"><span class="text-bold">{{ e.degree }}</span>, {{ e.school }}{{ e.details ? ' — ' + e.details : '' }}</p>
            <span class="set-text-13 color-gray-600 text-italic">{{ dateRange(e.start, e.end) }}</span>
          </div>
        </div>
      </section>
      <section v-if="has(certifications)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Qualifications</h2>
        <div class="md:span-col-3">
          <p v-for="(c, i) in certifications" :key="i" class="set-text-14 color-gray-800 add-margin-bottom-4"><span class="text-bold">{{ c.name }}</span>, {{ c.issuer }} ({{ c.year }})</p>
        </div>
      </section>
      <section v-if="has(skills)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Skills</h2>
        <div class="md:span-col-3">
          <p class="set-text-14 color-gray-800 line-height-relaxed">{{ skills.map(s => s.name).join(' • ') }}</p>
        </div>
      </section>
      <section v-if="has(projects)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Projects</h2>
        <div class="md:span-col-3">
          <p v-for="(p, i) in projects" :key="i" class="set-text-14 color-gray-800 add-margin-bottom-4"><span class="text-bold">{{ p.name }}</span> — {{ p.description }}</p>
        </div>
      </section>
      <section v-if="has(languages)" class="make-grid grid-cols-1 md:grid-cols-4 gap-x-16 add-padding-y-20 add-border-top-1 border-color-gray-300 break-inside-avoid">
        <h2 :class="'font-serif set-text-14 text-bold text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">Languages</h2>
        <div class="md:span-col-3">
          <p class="set-text-14 color-gray-800">{{ languages.map(l => l.name + ' (' + l.level + ')').join(', ') }}</p>
        </div>
      </section>
    </article>
  </main>
</template>
