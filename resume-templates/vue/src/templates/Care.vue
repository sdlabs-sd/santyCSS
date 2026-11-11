<script setup>
import { dateRange } from '@shared/format.js';
import { A, Avatar, contacts, has, templateProps, useResume } from './parts.js';

/** Care — Registered Nurse. Calm, scannable, licences and certifications first. */
const props = defineProps(templateProps);
const { basics, experience, education, skills, projects, certifications, languages, links, stats } = useResume(props);
</script>

<template>
  <main :class="'font-sans min-height-screen add-padding-y-40 add-padding-x-16 on-mobile:add-padding-0 ' + accent.soft">
    <article class="max-width-896 center-margin background-white round-corners-24 add-shadow-md overflow-hidden print:no-shadow">
      <header class="add-padding-40 on-mobile:add-padding-24 make-flex flex-wrap align-center gap-24">
        <Avatar :basics="basics" :class="'set-width-96 set-height-96 make-circle add-border-4 flex-shrink-0 ' + accent.borderSoft" :fallbackClass="'set-text-32 text-bold ' + accent.softer + ' ' + accent.textStrong" />
        <div class="flex-1 min-width-240">
          <h1 class="set-text-36 on-mobile:set-text-28 text-bold color-gray-900 line-height-tight">{{ basics.name }}</h1>
          <p :class="'set-text-18 text-medium add-margin-top-4 ' + accent.text">{{ basics.title }}</p>
        </div>
      </header>
      <div :class="'add-padding-x-40 add-padding-y-16 on-mobile:add-padding-x-24 make-flex flex-wrap gap-x-28 gap-y-8 set-text-14 ' + accent.softer">
        <A v-for="c in contacts(basics)" :key="c.key" :href="c.href" class="color-gray-700 text-no-decoration on-hover:color-gray-900"><span :class="accent.text">{{ c.icon }}</span> {{ c.label }}</A>
        <A v-for="l in links" :key="l.url" :href="l.url" :class="'text-semibold text-no-decoration ' + accent.textStrong">{{ l.label }}</A>
      </div>

      <div class="add-padding-40 on-mobile:add-padding-24">
        <p v-if="basics.summary" class="set-text-15 color-gray-700 line-height-relaxed add-margin-bottom-32">{{ basics.summary }}</p>

        <section v-if="has(certifications)" class="add-margin-bottom-32">
          <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Licences &amp; certifications</h2>
          <div class="make-grid grid-cols-1 md:grid-cols-3 gap-12">
            <div v-for="(c, i) in certifications" :key="i" :class="'round-corners-12 add-padding-16 add-border-1 ' + accent.borderSoft">
              <p :class="'set-text-12 text-bold text-uppercase letter-space-wide ' + accent.text">{{ c.year }}</p>
              <p class="set-text-14 text-bold color-gray-900 add-margin-top-4">{{ c.name }}</p>
              <p class="set-text-12 color-gray-500 add-margin-top-2">{{ c.issuer }}</p>
            </div>
          </div>
        </section>

        <div class="make-grid grid-cols-1 md:grid-cols-3 gap-32">
          <div class="md:span-col-2">
            <section v-if="has(experience)" class="add-margin-bottom-32">
              <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Clinical experience</h2>
              <div v-for="(x, i) in experience" :key="i" class="add-margin-bottom-24 break-inside-avoid">
                <h3 class="set-text-16 text-bold color-gray-900">{{ x.role }}</h3>
                <p class="set-text-14 color-gray-600">{{ x.company }}{{ x.location ? ', ' + x.location : '' }} · <span class="text-semibold">{{ dateRange(x.start, x.end) }}</span></p>
                <ul class="add-padding-left-20 add-margin-top-8 set-text-14 color-gray-700 line-height-relaxed">
                  <li v-for="(h, j) in x.highlights" :key="j" class="add-margin-bottom-4">{{ h }}</li>
                </ul>
              </div>
            </section>
            <section v-if="has(education)">
              <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Education</h2>
              <div v-for="(e, i) in education" :key="i" class="add-margin-bottom-12">
                <p class="set-text-15 text-bold color-gray-900">{{ e.degree }}</p>
                <p class="set-text-14 color-gray-600">{{ e.school }} · {{ dateRange(e.start, e.end) }}</p>
              </div>
            </section>
          </div>
          <aside>
            <section v-if="has(stats)" class="add-margin-bottom-32">
              <div v-for="s in stats" :key="s.label" :class="'round-corners-12 add-padding-16 add-margin-bottom-12 ' + accent.soft">
                <p :class="'set-text-28 text-extrabold ' + accent.textStrong">{{ s.value }}</p>
                <p class="set-text-13 color-gray-600">{{ s.label }}</p>
              </div>
            </section>
            <section v-if="has(skills)" class="add-margin-bottom-32">
              <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Core skills</h2>
              <ul class="list-none add-padding-0 add-margin-0">
                <li v-for="s in skills" :key="s.name" class="make-flex align-center gap-8 set-text-14 color-gray-800 add-margin-bottom-8"><span :class="'set-width-6 set-height-6 make-circle flex-shrink-0 ' + accent.bar" />{{ s.name }}</li>
              </ul>
            </section>
            <section v-if="has(languages)">
              <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Languages</h2>
              <p v-for="l in languages" :key="l.name" class="set-text-14 color-gray-700 add-margin-bottom-4">{{ l.name }} <span class="color-gray-400">· {{ l.level }}</span></p>
            </section>
            <section v-if="has(projects)" class="add-margin-top-32">
              <h2 :class="'set-text-16 text-bold add-padding-bottom-8 add-margin-bottom-16 add-border-bottom-2 ' + accent.textStrong + ' ' + accent.borderSoft">Projects</h2>
              <p v-for="(p, i) in projects" :key="i" class="set-text-14 color-gray-700 add-margin-bottom-8"><span class="text-bold">{{ p.name }}</span> — {{ p.description }}</p>
            </section>
          </aside>
        </div>
      </div>
    </article>
  </main>
</template>
