<script setup>
import { dateRange } from '@shared/format.js';
import { A, contacts, has, templateProps, useResume } from './parts.js';

/** Counsel (premium) — Corporate Lawyer. Refined serif, admissions and matters. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
const SEP = '  ·  ';
</script>

<template>
  <main class="font-sans min-height-screen background-stone-200 add-padding-y-48 add-padding-x-16 on-mobile:add-padding-0">
    <article class="max-width-840 center-margin background-white add-shadow-lg add-padding-64 on-mobile:add-padding-24 add-border-1 border-color-stone-300 print:no-shadow">
      <header class="text-center add-margin-bottom-40">
        <p :class="'font-serif set-text-14 text-italic ' + accent.text">Curriculum Vitae</p>
        <h1 class="font-serif set-text-48 on-mobile:set-text-32 text-regular color-stone-900 letter-space-wide add-margin-top-8">{{ basics.name }}</h1>
        <p class="set-text-13 text-uppercase letter-space-widest color-stone-600 add-margin-top-8">{{ basics.title }}</p>
        <div class="make-flex justify-center align-center gap-12 add-margin-y-20" aria-hidden="true">
          <span class="set-width-64 set-height-1 background-stone-300" />
          <span :class="'set-width-8 set-height-8 rotate-45 ' + accent.solid" />
          <span class="set-width-64 set-height-1 background-stone-300" />
        </div>
        <p class="font-serif set-text-14 color-stone-600">
          <span v-for="(c, i) in contacts(basics)" :key="c.key">{{ i > 0 ? SEP : '' }}<A :href="c.href" class="color-stone-600 text-no-decoration">{{ c.label }}</A></span>
          <span v-for="l in links" :key="l.url">{{ SEP }}<A :href="l.url" :class="'text-no-decoration ' + accent.text">{{ l.label }}</A></span>
        </p>
      </header>

      <p v-if="basics.summary" class="font-serif set-text-17 color-stone-700 line-height-relaxed text-center text-italic add-margin-bottom-40 max-width-640 center-margin">“{{ basics.summary }}”</p>

      <section v-if="has(certifications)" class="add-margin-bottom-32">
        <div class="set-height-1 background-stone-300 add-margin-bottom-24" />
        <h2 class="text-center add-margin-bottom-24"><span class="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">Admissions</span></h2>
        <div class="make-flex flex-wrap justify-center gap-16">
          <div v-for="(c, i) in certifications" :key="i" :class="'text-center add-padding-x-20 add-padding-y-12 add-border-1 ' + accent.borderSoft">
            <p class="font-serif set-text-15 color-stone-900">{{ c.name }}</p>
            <p class="set-text-12 color-stone-500 add-margin-top-2">{{ c.issuer }}, {{ c.year }}</p>
          </div>
        </div>
      </section>

      <section v-if="has(experience)" class="add-margin-bottom-32">
        <div class="set-height-1 background-stone-300 add-margin-bottom-24" />
        <h2 class="text-center add-margin-bottom-24"><span class="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">Professional experience</span></h2>
        <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-24 break-inside-avoid">
          <div class="make-flex flex-wrap justify-between gap-8 align-baseline">
            <h3 class="font-serif set-text-19 color-stone-900">{{ x.company }}</h3>
            <span class="font-serif set-text-14 text-italic color-stone-500">{{ dateRange(x.start, x.end) }}</span>
          </div>
          <p :class="'set-text-13 text-uppercase letter-space-wider add-margin-bottom-8 ' + accent.textStrong">{{ x.role }}{{ x.location ? ' — ' + x.location : '' }}</p>
          <ul class="add-padding-left-20 font-serif set-text-15 color-stone-700 line-height-relaxed">
            <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
          </ul>
        </div>
      </section>

      <section v-if="has(projects)" class="add-margin-bottom-32">
        <div class="set-height-1 background-stone-300 add-margin-bottom-24" />
        <h2 class="text-center add-margin-bottom-24"><span class="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">Notable matters</span></h2>
        <p v-for="(p, i) in projects" :key="i" class="font-serif set-text-15 color-stone-700 add-margin-bottom-8"><span class="color-stone-900 text-bold">{{ p.name }}.</span> {{ p.description }}</p>
      </section>

      <section v-if="has(education)" class="add-margin-bottom-32">
        <div class="set-height-1 background-stone-300 add-margin-bottom-24" />
        <h2 class="text-center add-margin-bottom-24"><span class="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">Education</span></h2>
        <div v-for="(e, i) in education" :key="i" class="make-flex flex-wrap justify-between gap-8 add-margin-bottom-10">
          <p class="font-serif set-text-15 color-stone-800"><span class="text-bold">{{ e.school }}</span> — {{ e.degree }}{{ e.details ? ', ' + e.details : '' }}</p>
          <span class="font-serif set-text-14 text-italic color-stone-500">{{ dateRange(e.start, e.end) }}</span>
        </div>
      </section>

      <section v-if="has(skills) || has(languages) || has(stats)">
        <div class="set-height-1 background-stone-300 add-margin-bottom-24" />
        <h2 class="text-center add-margin-bottom-24"><span class="font-serif set-text-14 text-uppercase letter-space-widest color-stone-900 add-padding-x-16 background-white position-relative">Practice &amp; languages</span></h2>
        <p class="font-serif set-text-15 color-stone-700 text-center line-height-relaxed">{{ skills.map(s => s.name).join(' · ') }}</p>
        <p v-if="has(languages)" class="font-serif set-text-14 color-stone-500 text-center text-italic add-margin-top-8">{{ languages.map(l => l.name + ' (' + l.level + ')').join(', ') }}</p>
        <div v-if="has(stats)" class="make-flex flex-wrap justify-center gap-40 add-margin-top-24">
          <div v-for="s in stats" :key="s.label" class="text-center">
            <p :class="'font-serif set-text-30 ' + accent.textStrong">{{ s.value }}</p>
            <p class="set-text-12 text-uppercase letter-space-widest color-stone-500">{{ s.label }}</p>
          </div>
        </div>
      </section>
    </article>
  </main>
</template>
