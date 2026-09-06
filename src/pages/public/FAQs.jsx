import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, HelpCircle, MessageSquare } from 'lucide-react';
import { mockDb } from '../../services/mockDb';
import '../../styles/pages.css';

export default function FAQs() {
  const [faqs, setFaqs] = useState(() => mockDb.getFAQs());
  const [openFaqId, setOpenFaqId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const handleContentUpdate = () => {
      setFaqs(mockDb.getFAQs());
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'faqs' || type === 'storage_sync') {
        handleContentUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
    };
  }, []);

  // Dynamically derive categories from all active FAQs
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    faqs.forEach(f => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    if (activeCategory === 'All') return faqs;
    return faqs.filter((item) => item.category === activeCategory || (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase())));
  }, [faqs, activeCategory]);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-page-wrapper">
      {/* 1. Compact Hero Header */}
      <section className="faq-hero-compact" aria-labelledby="faq-page-title">
        <div className="faq-hero-content">
          <h1 id="faq-page-title" className="faq-hero-title">
            Frequently Asked Questions
          </h1>
          <p className="faq-hero-subtitle">
            Everything you need to know about creating your profile, finding meaningful matches, and connecting safely.
          </p>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="faq-main-container">
        {/* Category Pills Filter */}
        <div className="faq-pills-bar" role="tablist" aria-label="FAQ Categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`faq-pill-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="faq-page-accordion" role="region" aria-label="Frequently Asked Questions List">
          {filteredFaqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6A636D' }}>
              <HelpCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>No questions found in this category.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-page-card ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-page-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faqpage-answer-${faq.id}`}
                    id={`faqpage-question-${faq.id}`}
                  >
                    <div className="faq-trigger-content">
                      {faq.category && (
                        <div className="faq-category-wrap">
                          <span className="faq-category-badge">
                            {faq.category}
                          </span>
                        </div>
                      )}
                      <h3 className="faq-page-question">{faq.question}</h3>
                    </div>
                    <div className="faq-page-icon" aria-hidden="true">
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <div
                    id={`faqpage-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faqpage-question-${faq.id}`}
                    className={`faq-page-answer-wrap ${isOpen ? 'show' : ''}`}
                  >
                    <div className="faq-page-answer-inner">
                      <p className="faq-page-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3. Still Have Questions Box */}
        <section className="faq-still-card" aria-label="Need Help">
          <div className="faq-still-left">
            <div className="faq-still-icon-wrap">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="faq-still-title">Still have questions?</h2>
              <p className="faq-still-desc">
                Our caring support team is available 7 days a week to guide you on your matchmaking journey.
              </p>
            </div>
          </div>
          <Link to="/contact" className="faq-still-btn">
            Contact Support <ArrowRight size={14} />
          </Link>
        </section>
      </main>
    </div>
  );
}
