<script setup>
import { dateRange, dots } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Chalkboard — Teacher. Friendly coloured sidebar, subjects and achievements. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main class="font-sans min-height-screen background-amber-50 add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0">
    <article class="max-width-1024 center-margin background-white round-corners-24 add-shadow-lg overflow-hidden make-grid grid-cols-1 md:grid-cols-3 print:no-shadow">
      <aside :class="'add-padding-32 color-white ' + accent.strong">
        <Avatar :basics="basics" class="set-width-120 set-height-120 make-circle add-border-4 border-color-white add-margin-bottom-20" :fallbackClass="'set-text-40 text-bold ' + accent.deep" />
        <h1 class="set-text-30 text-extrabold line-height-tight">{{ basics.name }}</h1>
        <p :class="'set-text-16 add-margin-top-6 add-margin-bottom-28 ' + accent.textLight">{{ basics.title }}</p>

        <h2 :class="'set-text-12 text-bold text-uppercase letter-space-widest add-margin-bottom-12 ' + accent.textLight">Contact</h2>
        <ul class="list-none add-padding-0 add-margin-0 add-margin-bottom-28 set-text-14">
          <li v-for="c in contacts(basics)" :key="c.key" class="add-margin-bottom-8"><A :href="c.href" class="color-white text-no-decoration">{{ c.icon }} {{ c.label }}</A></li>
          <li v-for="l in links" :key="l.url" class="add-margin-bottom-8"><A :href="l.url" class="color-white text-underline">{{ l.label }}</A></li>
        </ul>

        <template v-if="has(skills)">
          <h2 :class="'set-text-12 text-bold text-uppercase letter-space-widest add-margin-bottom-12 ' + accent.textLight">Teaching strengths</h2>
          <ul class="list-none add-padding-0 add-margin-0 add-margin-bottom-28">
            <li v-for="s in skills" :key="s.name" class="add-margin-bottom-10">
              <p class="set-text-14 add-margin-bottom-4">{{ s.name }}</p>
              <div class="make-flex gap-4" :aria-label="s.level + ' out of 100'">
                <span v-for="n in 5" :key="n" :class="'set-width-10 set-height-10 make-circle ' + (n <= dots(s.level) ? 'background-white' : accent.deep)" />
              </div>
            </li>
          </ul>
        </template>
        <template v-if="has(languages)">
          <h2 :class="'set-text-12 text-bold text-uppercase letter-space-widest add-margin-bottom-12 ' + accent.textLight">Languages</h2>
          <p v-for="l in languages" :key="l.name" class="set-text-14 add-margin-bottom-4">{{ l.name }} <span :class="accent.textLight">· {{ l.level }}</span></p>
        </template>
      </aside>

      <div class="md:span-col-2 add-padding-40 on-mobile:add-padding-24">
        <section v-if="basics.summary" class="add-margin-bottom-32">
          <h2 class="make-flex align-center gap-10 set-text-20 text-bold color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-32 set-height-32 round-corners-10 set-text-16 ' + accent.softer">✏️</span>About me</h2>
          <p class="set-text-15 color-gray-700 line-height-relaxed">{{ basics.summary }}</p>
        </section>
        <div v-if="has(stats)" class="make-flex flex-wrap gap-12 add-margin-bottom-32">
          <div v-for="s in stats" :key="s.label" class="flex-1 min-width-140 round-corners-16 add-padding-16 background-amber-50 add-border-2 border-color-amber-200 text-center">
            <p class="set-text-26 text-extrabold color-amber-700">{{ s.value }}</p>
            <p class="set-text-12 text-semibold color-gray-600">{{ s.label }}</p>
          </div>
        </div>
        <section v-if="has(experience)" class="add-margin-bottom-32">
          <h2 class="make-flex align-center gap-10 set-text-20 text-bold color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-32 set-height-32 round-corners-10 set-text-16 ' + accent.softer">🏫</span>Teaching experience</h2>
          <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-24 break-inside-avoid">
            <div class="make-flex flex-wrap justify-between gap-8">
              <h3 class="set-text-17 text-bold color-gray-900">{{ x.role }}</h3>
              <span :class="'set-text-13 text-semibold ' + accent.text">{{ dateRange(x.start, x.end) }}</span>
            </div>
            <p class="set-text-14 color-gray-500 add-margin-bottom-8">{{ x.company }}{{ x.location ? ', ' + x.location : '' }}</p>
            <ul class="add-padding-left-20 set-text-14 color-gray-700 line-height-relaxed">
              <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
            </ul>
          </div>
        </section>
        <section v-if="has(education)" class="add-margin-bottom-32">
          <h2 class="make-flex align-center gap-10 set-text-20 text-bold color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-32 set-height-32 round-corners-10 set-text-16 ' + accent.softer">🎓</span>Education</h2>
          <div class="make-grid grid-cols-1 md:grid-cols-2 gap-12">
            <div v-for="(e, i) in education" :key="i" class="round-corners-12 add-padding-16 background-gray-50">
              <p class="set-text-15 text-bold color-gray-900">{{ e.degree }}</p>
              <p class="set-text-13 color-gray-600">{{ e.school }}</p>
              <p :class="'set-text-12 text-semibold add-margin-top-4 ' + accent.text">{{ dateRange(e.start, e.end) }}</p>
            </div>
          </div>
        </section>
        <section v-if="has(certifications) || has(projects)">
          <h2 class="make-flex align-center gap-10 set-text-20 text-bold color-gray-900 add-margin-bottom-16"><span :class="'make-inline-flex align-center justify-center set-width-32 set-height-32 round-corners-10 set-text-16 ' + accent.softer">🏅</span>Certifications &amp; initiatives</h2>
          <p v-for="(c, i) in certifications" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-6">✔ <span class="text-semibold">{{ c.name }}</span> — {{ c.issuer }}, {{ c.year }}</p>
          <p v-for="(p, i) in projects" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-6">✔ <span class="text-semibold">{{ p.name }}</span> — {{ p.description }}</p>
        </section>
      </div>
    </article>
  </main>
</template>
