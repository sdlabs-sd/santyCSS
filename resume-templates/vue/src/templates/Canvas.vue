<script setup>
import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Canvas — Product Designer. Editorial oversized name, case-study cards. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-stone-100 add-padding-y-40 on-mobile:add-padding-y-0">
    <article class="max-width-960 center-margin background-white add-shadow-lg add-padding-56 on-mobile:add-padding-24 print:no-shadow">
      <header class="make-flex flex-wrap align-end justify-between gap-24 add-padding-bottom-40 add-border-bottom-1 border-color-stone-200">
        <div class="flex-1 min-width-280">
          <span :class="'make-inline-block set-text-12 text-bold text-uppercase letter-space-widest add-padding-x-12 add-padding-y-6 make-pill add-margin-bottom-20 ' + accent.softer + ' ' + accent.textStrong">{{ basics.title }}</span>
          <h1 class="set-text-64 on-mobile:set-text-40 text-extrabold color-stone-900 line-height-tight letter-space-tight text-balance">{{ basics.name }}</h1>
        </div>
        <Avatar :basics="basics" class="set-width-120 set-height-120 round-corners-24 flex-shrink-0" :fallbackClass="'set-text-40 text-extrabold color-white ' + accent.solid" />
      </header>

      <div class="make-grid grid-cols-1 md:grid-cols-3 add-padding-top-40">
        <div class="add-padding-right-32 on-mobile:add-padding-0 add-margin-bottom-32">
          <section class="add-margin-bottom-32">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Contact</h2>
            <ul class="list-none add-padding-0 add-margin-0">
              <li v-for="c in contacts(basics)" :key="c.key" class="set-text-14 add-margin-bottom-8">
                <A :href="c.href" class="color-stone-700 text-no-decoration on-hover:color-stone-900">{{ c.label }}</A>
              </li>
              <li v-for="l in links" :key="l.url" class="set-text-14 add-margin-bottom-8">
                <A :href="l.url" :class="'text-semibold text-no-decoration ' + accent.text">{{ l.label }} ↗</A>
              </li>
            </ul>
          </section>
          <section v-if="has(skills)" class="add-margin-bottom-32">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Toolkit</h2>
            <div class="make-flex flex-wrap gap-8">
              <span v-for="s in skills" :key="s.name" class="set-text-13 text-medium color-stone-800 add-border-1 border-color-stone-300 add-padding-x-12 add-padding-y-6 make-pill">{{ s.name }}</span>
            </div>
          </section>
          <section v-if="has(stats)" class="add-margin-bottom-32">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Impact</h2>
            <div v-for="s in stats" :key="s.label" class="add-margin-bottom-16">
              <p :class="'set-text-32 text-extrabold line-height-tight ' + accent.text">{{ s.value }}</p>
              <p class="set-text-13 color-stone-500">{{ s.label }}</p>
            </div>
          </section>
          <section v-if="has(education)" class="add-margin-bottom-32">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Education</h2>
            <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-12">
              <p class="set-text-14 text-bold color-stone-900">{{ e.degree }}</p>
              <p class="set-text-13 color-stone-500">{{ e.school }}, {{ dateRange(e.start, e.end) }}</p>
            </div>
          </section>
          <section v-if="has(languages) || has(certifications)">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Also</h2>
            <p v-for="(c, i) in certifications" :key="i" class="set-text-13 color-stone-700 add-margin-bottom-6">{{ c.name }} — {{ c.year }}</p>
            <p v-for="l in languages" :key="l.name" class="set-text-13 color-stone-700 add-margin-bottom-6">{{ l.name }} · {{ l.level }}</p>
          </section>
        </div>

        <div class="md:span-col-2">
          <p v-if="basics.summary" class="set-text-22 on-mobile:set-text-18 color-stone-800 line-height-snug add-margin-bottom-40 text-medium">{{ basics.summary }}</p>
          <section v-if="has(projects)" class="add-margin-bottom-40">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Selected work</h2>
            <div class="make-grid grid-cols-1 md:grid-cols-2 gap-16">
              <A v-for="(p, i) in projects" :key="i" :href="p.url" :class="'make-block text-no-decoration round-corners-16 add-padding-24 break-inside-avoid transition-all on-hover:translate-y-minus-4 ' + (i === 0 ? accent.solid + ' color-white' : 'background-stone-100 color-stone-900')">
                <p class="set-text-12 text-bold text-uppercase letter-space-wider opacity-75">{{ p.tags.join(' · ') }}</p>
                <p class="set-text-20 text-extrabold add-margin-top-24 line-height-tight">{{ p.name }}</p>
                <p class="set-text-14 add-margin-top-8 opacity-90 line-height-relaxed">{{ p.description }}</p>
              </A>
            </div>
          </section>
          <section v-if="has(experience)">
            <h2 class="set-text-12 text-bold text-uppercase letter-space-widest color-stone-400 add-margin-bottom-20">Experience</h2>
            <div v-for="(x, i) in experience" :key="i" class="add-padding-y-20 add-border-top-1 border-color-stone-200 break-inside-avoid">
              <div class="make-flex flex-wrap justify-between gap-8">
                <h3 class="set-text-18 text-bold color-stone-900">{{ x.role }} <span :class="accent.text">@ {{ x.company }}</span></h3>
                <span class="set-text-13 color-stone-500">{{ dateRange(x.start, x.end) }}</span>
              </div>
              <ul class="add-margin-top-8 add-padding-left-20 color-stone-600 set-text-14 line-height-relaxed">
                <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </article>
  </main>
</template>
